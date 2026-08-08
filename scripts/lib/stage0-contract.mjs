function sameMembers(left, right) {
  return JSON.stringify([...left].sort()) === JSON.stringify([...right].sort());
}

export function validateStage0Relationships({ matrix, coverage, occurrencesDocument, occurrenceMapDocument }) {
  const candidates = matrix.candidates ?? [];
  const candidateIds = new Set();
  for (const candidate of candidates) {
    if (candidateIds.has(candidate.candidateId)) throw new Error(`候选 ID 重复：${candidate.candidateId}`);
    candidateIds.add(candidate.candidateId);
  }

  const artifacts = coverage.artifacts ?? [];
  const artifactsById = new Map();
  for (const artifact of artifacts) {
    if (artifactsById.has(artifact.artifactId)) throw new Error(`artifactId 重复：${artifact.artifactId}`);
    artifactsById.set(artifact.artifactId, artifact);
    if (!["pending", "screened", "excluded", "blocked"].includes(artifact.screenStatus)) throw new Error(`${artifact.artifactId} screenStatus 非法`);
    if (artifact.screenStatus === "excluded" && !artifact.exclusionReason?.trim()) throw new Error(`${artifact.artifactId} excluded 时必须提供 exclusionReason`);
    if (artifact.screenStatus === "screened" && artifact.expectedUnitCount != null && artifact.screenedUnitCount !== artifact.expectedUnitCount) {
      throw new Error(`${artifact.artifactId} screenedUnitCount 与 expectedUnitCount 不一致`);
    }
  }

  const occurrences = Array.isArray(occurrencesDocument) ? occurrencesDocument : occurrencesDocument.occurrences;
  const occurrencesById = new Map();
  const occurrenceIdsByArtifact = new Map();
  for (const occurrence of occurrences) {
    if (occurrencesById.has(occurrence.occurrenceId)) throw new Error(`occurrenceId 重复：${occurrence.occurrenceId}`);
    if (!artifactsById.has(occurrence.artifactId)) throw new Error(`${occurrence.occurrenceId} 引用未知 artifactId：${occurrence.artifactId}`);
    occurrencesById.set(occurrence.occurrenceId, occurrence);
    occurrenceIdsByArtifact.set(occurrence.artifactId, [...(occurrenceIdsByArtifact.get(occurrence.artifactId) ?? []), occurrence.occurrenceId]);
  }

  for (const artifact of artifacts) {
    const registered = artifact.occurrenceIds ?? [];
    for (const occurrenceId of registered) {
      const occurrence = occurrencesById.get(occurrenceId);
      if (!occurrence) throw new Error(`${artifact.artifactId} occurrenceIds 引用未知 occurrenceId：${occurrenceId}`);
      if (occurrence.artifactId !== artifact.artifactId) throw new Error(`${artifact.artifactId} 错误登记其他 artifact 的 occurrence：${occurrenceId}`);
    }
    if (artifact.screenStatus === "screened" && !sameMembers(registered, occurrenceIdsByArtifact.get(artifact.artifactId) ?? [])) {
      throw new Error(`${artifact.artifactId} screened 时 occurrenceIds 必须与已提取 occurrence 精确一致`);
    }
  }

  const ownersByOccurrence = new Map();
  for (const candidate of candidates) {
    for (const occurrenceId of candidate.sourceOccurrenceIds ?? []) {
      if (!occurrencesById.has(occurrenceId)) throw new Error(`${candidate.candidateId} 引用未知 sourceOccurrenceId：${occurrenceId}`);
      ownersByOccurrence.set(occurrenceId, [...(ownersByOccurrence.get(occurrenceId) ?? []), candidate.candidateId]);
    }
  }

  const occurrenceMapping = occurrenceMapDocument.mapping ?? {};
  for (const occurrenceId of occurrencesById.keys()) {
    const mapping = occurrenceMapping[occurrenceId];
    if (!mapping) throw new Error(`${occurrenceId} 缺少 occurrence-candidate 映射`);
    if (!candidateIds.has(mapping.candidateId)) throw new Error(`${occurrenceId} 映射到未知 candidateId：${mapping.candidateId}`);
    const owners = ownersByOccurrence.get(occurrenceId) ?? [];
    if (owners.length !== 1) throw new Error(`${occurrenceId} 必须且只能归入一个候选；当前归属：${owners.join(",") || "无"}`);
    if (mapping.candidateId !== owners[0]) throw new Error(`${occurrenceId} 映射为 ${mapping.candidateId}，但候选矩阵归属为 ${owners[0]}`);
  }
  for (const occurrenceId of Object.keys(occurrenceMapping)) {
    if (!occurrencesById.has(occurrenceId)) throw new Error(`occurrence-candidate 映射引用未知 occurrenceId：${occurrenceId}`);
  }

  return {
    artifacts,
    candidateIds,
    occurrenceIds: new Set(occurrencesById.keys()),
    pendingCoverage: artifacts.filter((artifact) => ["pending", "blocked"].includes(artifact.screenStatus)),
  };
}
