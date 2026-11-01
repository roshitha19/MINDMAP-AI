/**
 * Prerequisite Topological Sorting and Roadmap Engine
 */

const sortConceptsByPrerequisites = (concepts) => {
  const inDegree = new Map();
  const adj = new Map();
  const idMap = new Map();

  concepts.forEach(c => {
    const id = c._id ? c._id.toString() : c.name;
    idMap.set(id, c);
    inDegree.set(id, 0);
    adj.set(id, []);
  });

  concepts.forEach(c => {
    const currentId = c._id ? c._id.toString() : c.name;
    if (c.prerequisites && Array.isArray(c.prerequisites)) {
      c.prerequisites.forEach(prereq => {
        const prereqId = prereq._id ? prereq._id.toString() : prereq.toString();
        if (adj.has(prereqId)) {
          adj.get(prereqId).push(currentId);
          inDegree.set(currentId, (inDegree.get(currentId) || 0) + 1);
        }
      });
    }
  });

  const queue = [];
  inDegree.forEach((degree, id) => {
    if (degree === 0) queue.push(id);
  });

  const sorted = [];
  while (queue.length > 0) {
    const currId = queue.shift();
    if (idMap.has(currId)) {
      sorted.push(idMap.get(currId));
    }
    const neighbors = adj.get(currId) || [];
    neighbors.forEach(neighborId => {
      inDegree.set(neighborId, inDegree.get(neighborId) - 1);
      if (inDegree.get(neighborId) === 0) {
        queue.push(neighborId);
      }
    });
  }

  // Add any remaining concepts (e.g. cycles)
  concepts.forEach(c => {
    const id = c._id ? c._id.toString() : c.name;
    if (!sorted.some(s => (s._id ? s._id.toString() : s.name) === id)) {
      sorted.push(c);
    }
  });

  return sorted;
};

module.exports = {
  sortConceptsByPrerequisites,
};
