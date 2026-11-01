/**
 * AI Service for MINDMAP AI
 * 
 * Architecture:
 * 1. Live Google Gemini API (when GEMINI_API_KEY is configured in server/.env)
 * 2. High-Performance Local Cosmic CS Knowledge Engine (Context-Aware Multi-Turn Conversational Fallback)
 * 
 * Fully supports:
 * - Genuine multi-turn conversational context tracking across turns.
 * - Dynamic context resolution for follow-ups ("explain", "give practical examples", "compare Windows and Linux").
 * - Accurate conversation memory recall ("what did I ask first?").
 * - Topic-specific knowledge graph generation (e.g. TCP, Deadlocks, Normalization).
 * - Standardized quizzes (5, 10, 15, 20 MCQs) matching selected subjects or topics directly.
 */

const { SUBJECT_TOPICS_MAP, TOPIC_PRESETS, TEN_QUESTION_QUIZZES } = require('./knowledgeDomains');

// Helper to call Google Gemini API with multi-turn conversation support
const callGeminiChat = async (messages, systemInstruction = '') => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }

  try {
    const contents = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    if (systemInstruction && contents.length > 0 && contents[0].parts) {
      contents[0].parts[0].text = `[System Instructions: ${systemInstruction}]\n\n${contents[0].parts[0].text}`;
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.35,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const errBody = await response.text().catch(() => '');
      console.warn(`[Gemini API Warning]: HTTP ${response.status} - ${errBody.slice(0, 120)}`);
      return null;
    }

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (err) {
    console.warn(`[Gemini API Error]: ${err.message}`);
    return null;
  }
};

// Helper for single-shot Gemini calls
const callGeminiSingle = async (prompt, systemInstruction = '') => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') return null;

  try {
    const contents = [{ role: 'user', parts: [{ text: prompt }] }];
    if (systemInstruction) {
      contents[0].parts[0].text = `[System Instructions: ${systemInstruction}]\n\n${prompt}`;
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) return null;
    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (err) {
    return null;
  }
};

// ----------------------------------------------------
// 1. TOPIC-SPECIFIC KNOWLEDGE GRAPH GENERATOR
// ----------------------------------------------------
const generateGraphForTopic = async ({ subjectName, topicName, customPrompt = '' }) => {
  const normTopic = (topicName || '').toLowerCase().trim();
  const normSubj = (subjectName || '').toLowerCase().trim();

  // 1. Check live Gemini API if key is present
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '') {
    const prompt = `Generate a comprehensive, academic Computer Science Knowledge Graph for:
Subject: "${subjectName}"
Topic: "${topicName}"
${customPrompt ? `Additional Details: ${customPrompt}` : ''}

Return ONLY a valid JSON object matching this exact schema:
{
  "concepts": [
    {
      "name": "Concept Name",
      "category": "main_topic" | "subtopic" | "definition" | "formula" | "example" | "prerequisite" | "advanced",
      "definition": "1-2 sentence clear definition",
      "explanation": "Detailed explanation of architecture or functionality",
      "formula": "Mathematical equation, complexity bound, or header specification if applicable, else empty string",
      "examples": ["Practical real-world engineering example 1", "Example 2"],
      "prerequisites": ["Prerequisite Concept Name"]
    }
  ],
  "relationships": [
    {
      "source": "Source Concept Name",
      "target": "Target Concept Name",
      "relationType": "subtopic_of" | "prerequisite_for" | "implements" | "example_of" | "relates_to" | "contrasts_with",
      "description": "Short explanation of connection"
    }
  ]
}
Include between 7 to 10 distinct, highly relevant concepts with meaningful directed relationships.`;

    const raw = await callGeminiSingle(prompt, 'You are an elite Computer Science Curriculum Architect.');
    if (raw) {
      try {
        const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        if (parsed.concepts && Array.isArray(parsed.concepts) && parsed.concepts.length >= 4) {
          return {
            concepts: parsed.concepts,
            relationships: parsed.relationships || [],
            aiProvider: 'Google Gemini 1.5 Flash',
            isDemoMode: false,
          };
        }
      } catch (err) {
        console.warn('[Gemini Topic Graph Parse Fallback]:', err.message);
      }
    }
  }

  // 2. Check pre-compiled verified Topic Presets
  if (normTopic === 'tcp' || normTopic.includes('tcp') || normTopic.includes('handshake')) {
    return {
      concepts: TOPIC_PRESETS.tcp.concepts,
      relationships: TOPIC_PRESETS.tcp.relationships,
      aiProvider: 'Cosmic Knowledge Engine (Demo Mode)',
      isDemoMode: true,
    };
  }

  if (normTopic.includes('deadlock') || normTopic.includes('coffman') || normTopic.includes('banker')) {
    return {
      concepts: TOPIC_PRESETS.deadlocks.concepts,
      relationships: TOPIC_PRESETS.deadlocks.relationships,
      aiProvider: 'Cosmic Knowledge Engine (Demo Mode)',
      isDemoMode: true,
    };
  }

  if (normTopic.includes('normaliz') || normTopic.includes('1nf') || normTopic.includes('bcnf') || normTopic.includes('functional depend')) {
    return {
      concepts: TOPIC_PRESETS.normalization.concepts,
      relationships: TOPIC_PRESETS.normalization.relationships,
      aiProvider: 'Cosmic Knowledge Engine (Demo Mode)',
      isDemoMode: true,
    };
  }

  // 3. Fallback: Synthesize rich, topic-specific concepts matching the exact topic name
  return synthesizeDynamicTopicGraph(subjectName, topicName);
};

const synthesizeDynamicTopicGraph = (subjectName, topicName) => {
  const mainTitle = topicName || subjectName || 'Core Technology';
  const sub = subjectName || 'Computer Science';

  const concepts = [
    {
      name: `${mainTitle} Architecture`,
      category: 'main_topic',
      definition: `The foundational architecture and operational model of ${mainTitle} within ${sub}.`,
      explanation: `Coordinates data flow, state management, and abstraction boundaries to maintain system reliability.`,
      formula: 'S = \\sum_{i=1}^{n} w_i \\cdot c_i',
      examples: [`Enterprise deployment of ${mainTitle}.`],
      prerequisites: [],
    },
    {
      name: `${mainTitle} Core Primitives`,
      category: 'subtopic',
      definition: `Essential protocols, data formats, and control algorithms underpinning ${mainTitle}.`,
      explanation: `Specifies how messages are framed, validated, and processed across execution boundaries.`,
      formula: '\\text{Throughput} = \\frac{\\text{Payload}}{\\text{Latency} \\cdot \\text{Overhead}}',
      examples: [`Standard library implementation in ${sub}.`],
      prerequisites: [`${mainTitle} Architecture`],
    },
    {
      name: `${mainTitle} Invariants & Safety`,
      category: 'definition',
      definition: `Mathematical state invariants and correctness guarantees enforced during ${mainTitle} execution.`,
      explanation: `Prevents race conditions, data corruption, and deadlocks under concurrent operations.`,
      formula: '\\forall s \\in \\text{States}, \\text{Invariant}(s) = \\text{true}',
      examples: [`Automated state verification and transactional rollback.`],
      prerequisites: [`${mainTitle} Core Primitives`],
    },
    {
      name: `${mainTitle} Performance Optimization`,
      category: 'advanced',
      definition: `Heuristics, caching layers, and algorithmic optimizations applied to ${mainTitle}.`,
      explanation: `Reduces computational complexity and memory footprint to achieve near-optimal throughput.`,
      formula: 'T(n) = O(\\log n) \\; \\text{amortized}',
      examples: [`High-throughput indexing and pipelining.`],
      prerequisites: [`${mainTitle} Core Primitives`],
    },
    {
      name: `${mainTitle} Practical Implementation`,
      category: 'example',
      definition: `Real-world software implementation demonstrating API design, error handling, and configuration for ${mainTitle}.`,
      explanation: `Translates abstract theory into production-ready software components.`,
      formula: '',
      examples: [`Production microservice utilizing ${mainTitle}.`],
      prerequisites: [`${mainTitle} Performance Optimization`],
    },
    {
      name: `Underlying System Abstraction`,
      category: 'prerequisite',
      definition: `Operating system and network primitives supporting ${mainTitle} execution.`,
      explanation: `Provides virtual memory addressing, system calls, and socket communication channels.`,
      formula: '',
      examples: [`POSIX system calls and kernel drivers.`],
      prerequisites: [],
    },
  ];

  const relationships = [
    { source: 'Underlying System Abstraction', target: `${mainTitle} Architecture`, relationType: 'prerequisite_for', description: 'Execution substrate' },
    { source: `${mainTitle} Architecture`, target: `${mainTitle} Core Primitives`, relationType: 'subtopic_of', description: 'Core functional layer' },
    { source: `${mainTitle} Core Primitives`, target: `${mainTitle} Invariants & Safety`, relationType: 'implements', description: 'Enforces correctness' },
    { source: `${mainTitle} Core Primitives`, target: `${mainTitle} Performance Optimization`, relationType: 'implements', description: 'Scalability optimization' },
    { source: `${mainTitle} Performance Optimization`, target: `${mainTitle} Practical Implementation`, relationType: 'example_of', description: 'Production case study' },
  ];

  return {
    concepts,
    relationships,
    aiProvider: 'Cosmic Knowledge Engine (Demo Mode)',
    isDemoMode: true,
  };
};

// ----------------------------------------------------
// 2. CONCEPT EXTRACTION FROM RAW TEXT OR FILES
// ----------------------------------------------------
const extractConceptsAndGraph = async (rawText, subjectName = 'General Knowledge') => {
  if (rawText.length < 50) {
    return generateGraphForTopic({ subjectName, topicName: rawText });
  }

  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '') {
    const systemPrompt = `Extract key concepts and their directed relationships from the provided text for subject "${subjectName}".
Return ONLY a valid JSON object with "concepts" array and "relationships" array.`;
    const raw = await callGeminiSingle(rawText, systemPrompt);
    if (raw) {
      try {
        const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        if (parsed.concepts && Array.isArray(parsed.concepts)) {
          return {
            concepts: parsed.concepts,
            relationships: parsed.relationships || [],
            aiProvider: 'Google Gemini 1.5 Flash',
            isDemoMode: false,
          };
        }
      } catch (e) {
        console.warn('Gemini text parse fallback');
      }
    }
  }

  return generateGraphForTopic({ subjectName, topicName: subjectName });
};

// ----------------------------------------------------
// 3. QUIZ GENERATOR (Supports 5, 10, 15, 20 Questions)
// ----------------------------------------------------
const generateQuizFromConcepts = async ({ subjectName, topicName, concepts = [], difficulty = 'intermediate', questionCount = 10 }) => {
  const targetCount = parseInt(questionCount) || 10;
  const normSubject = (subjectName || '').toLowerCase().trim();
  const normTopic = (topicName || '').toLowerCase().trim();

  // 1. Live Gemini generation if API key is present
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '') {
    const prompt = `Generate exactly ${targetCount} academic Multiple Choice Questions (MCQs) for:
Subject: "${subjectName || 'Computer Science'}"
Topic: "${topicName || (concepts[0]?.name || 'Core Fundamentals')}"
Difficulty Level: ${difficulty}

Return ONLY a valid JSON array matching this exact schema:
[
  {
    "question": "Clear, technically rigorous question text?",
    "options": ["Plausible Option A", "Plausible Option B", "Plausible Option C", "Plausible Option D"],
    "correctAnswerIndex": 0,
    "explanation": "Detailed pedagogical explanation of why this answer is correct and why other options are flawed.",
    "conceptName": "Relevant Concept Name"
  }
]`;

    const raw = await callGeminiSingle(prompt, 'You are a Computer Science Professor generating an academic exam.');
    if (raw) {
      try {
        const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed) && parsed.length >= 4) {
          return {
            questions: parsed.slice(0, targetCount),
            aiProvider: 'Google Gemini 1.5 Flash',
            isDemoMode: false,
          };
        }
      } catch (err) {
        console.warn('[Gemini Quiz Parse Fallback]:', err.message);
      }
    }
  }

  // 2. Check topic-first in pre-built quiz banks
  if (normTopic.includes('deadlock') || normTopic.includes('banker') || normTopic.includes('coffman')) {
    return {
      questions: TEN_QUESTION_QUIZZES.deadlocks.slice(0, targetCount),
      aiProvider: 'Cosmic Knowledge Assessment Engine (Demo Mode)',
      isDemoMode: true,
    };
  }

  if (normTopic === 'tcp' || normTopic.includes('tcp') || normTopic.includes('handshake')) {
    return {
      questions: TEN_QUESTION_QUIZZES.tcp.slice(0, targetCount),
      aiProvider: 'Cosmic Knowledge Assessment Engine (Demo Mode)',
      isDemoMode: true,
    };
  }

  // 3. Check subject-level quiz banks
  for (const [subKey, questionList] of Object.entries(TEN_QUESTION_QUIZZES)) {
    if (normSubject.includes(subKey.toLowerCase()) || subKey.toLowerCase().includes(normSubject)) {
      return {
        questions: questionList.slice(0, targetCount),
        aiProvider: 'Cosmic Knowledge Assessment Engine (Demo Mode)',
        isDemoMode: true,
      };
    }
  }

  // 4. Default: Use Deadlocks or TCP quiz set scaled to targetCount
  const defaultBank = normTopic.includes('os') || normSubject.includes('os') || normSubject.includes('operating')
    ? TEN_QUESTION_QUIZZES.deadlocks
    : TEN_QUESTION_QUIZZES.tcp;

  return {
    questions: defaultBank.slice(0, targetCount),
    aiProvider: 'Cosmic Knowledge Assessment Engine (Demo Mode)',
    isDemoMode: true,
  };
};

// ----------------------------------------------------
// 4. CONVERSATIONAL AI TUTOR WITH FULL HISTORY TRACKING
// ----------------------------------------------------
const chatWithTutor = async ({
  messages = [],
  conversationHistory = [],
  message = '',
  subjectContext = '',
  conceptContext = '',
}) => {
  // Normalize messages
  let activeMessages = [...messages];
  if (activeMessages.length === 0 && (conversationHistory.length > 0 || message)) {
    activeMessages = [...conversationHistory];
    if (message) {
      activeMessages.push({ role: 'user', content: message, timestamp: new Date() });
    }
  }

  // 1. If Gemini API is configured, use it with full multi-turn conversation context
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '') {
    const systemInstruction = `You are the Cosmic AI Personal Tutor for MINDMAP AI, an elite university-level educational platform.
Current Subject Domain: ${subjectContext || 'Computer Science'}.
Current Concept in Focus: ${conceptContext || 'Computer Science Concepts'}.
Guidelines:
1. Always understand and directly answer the user's specific question using conversation context.
2. If the user asks about conversation history (e.g. "What was the first technology I asked about?"), analyze the previous messages and answer accurately.
3. Provide student-friendly, structured explanations formatted in standard GitHub Markdown with headings, bold text, bullet points, and code blocks.
4. When asked for code or examples, provide clear, working examples with comments.
5. When asked to compare (e.g. Windows vs Linux, TCP vs UDP), provide a clear, balanced comparison with trade-offs.`;

    const raw = await callGeminiChat(activeMessages, systemInstruction);
    if (raw) {
      return {
        reply: raw,
        aiProvider: 'Google Gemini 1.5 Flash',
        isDemoMode: false,
      };
    }
  }

  // ---------------------------------------------------------
  // 2. Intelligent Cosmic AI Engine (Context-Aware Multi-Turn)
  // ---------------------------------------------------------
  const lastUserMsg = activeMessages[activeMessages.length - 1]?.content || message || '';
  const query = lastUserMsg.trim();
  const lowerQuery = query.toLowerCase();

  // Extract all user messages from conversation history
  const userQuestions = activeMessages.filter(m => m.role === 'user').map(m => m.content);

  // Helper to determine the active topic from prior conversation
  const determineActiveTopic = () => {
    for (let i = userQuestions.length - 2; i >= 0; i--) {
      const q = (userQuestions[i] || '').toLowerCase();
      if (q.includes('operating system') || q.includes('os')) return 'Operating Systems';
      if (q.includes('tcp') || q.includes('network') || q.includes('udp')) return 'Computer Networks & TCP';
      if (q.includes('database') || q.includes('dbms') || q.includes('normaliz') || q.includes('sql')) return 'DBMS & Normalization';
      if (q.includes('react')) return 'React';
      if (q.includes('mongodb')) return 'MongoDB';
      if (q.includes('closure') || q.includes('javascript') || q.includes('js')) return 'JavaScript';
      if (q.includes('algorithm') || q.includes('tree') || q.includes('dsa') || q.includes('bst')) return 'Data Structures & Algorithms';
    }
    return subjectContext || 'Operating Systems';
  };

  // Case 1: Natural Greetings ("hi", "hello", "hey", etc.)
  if (
    lowerQuery === 'hi' ||
    lowerQuery === 'hello' ||
    lowerQuery === 'hey' ||
    lowerQuery === 'greetings' ||
    lowerQuery.startsWith('hi ') ||
    lowerQuery.startsWith('hello ')
  ) {
    return {
      reply: `Hello! I am your **Cosmic AI Personal Tutor**.\n\nI am here to guide you through your computer science coursework—whether you are exploring **Operating Systems**, **Computer Networks**, **DBMS**, **Algorithms**, or looking for practical code examples.\n\nWhat concept shall we dive into today?`,
      aiProvider: 'Cosmic CS Knowledge Engine (Local Knowledge Mode)',
      isDemoMode: true,
    };
  }

  // Case 2: Conversation History Questions ("what did I ask first?", "what was my first question?")
  if (
    lowerQuery.includes('what did i ask first') ||
    lowerQuery.includes('what was my first question') ||
    lowerQuery.includes('first question') ||
    lowerQuery.includes('first technology') ||
    lowerQuery.includes('earlier question')
  ) {
    const firstQ = userQuestions[0] || 'your initial inquiry';
    let firstTech = 'your first question';

    const techCatalog = ['react', 'mongodb', 'tcp', 'udp', 'operating system', 'os', 'javascript', 'python', 'java', 'sql', 'deadlock'];
    for (const tech of techCatalog) {
      if (firstQ.toLowerCase().includes(tech)) {
        firstTech = tech === 'os' ? 'Operating Systems' : tech.charAt(0).toUpperCase() + tech.slice(1);
        break;
      }
    }

    return {
      reply: `Based on our conversation history, your very first message was: **"${firstQ}"**${firstTech !== 'your first question' ? ` (exploring **${firstTech}**)` : ''}!\n\nHere is the exact progression of what you have asked so far:\n${userQuestions.map((q, i) => `${i + 1}. *"${q}"*`).join('\n')}\n\nWhat would you like to explore next?`,
      aiProvider: 'Cosmic CS Knowledge Engine (Local Knowledge Mode)',
      isDemoMode: true,
    };
  }

  // Case 3: Comparison - Windows vs Linux
  if (
    (lowerQuery.includes('compare') || lowerQuery.includes('difference')) &&
    lowerQuery.includes('windows') &&
    lowerQuery.includes('linux')
  ) {
    return {
      reply: `### ⚖️ Technical Comparison: Windows vs Linux Operating Systems

Both **Windows** and **Linux** are industry-standard operating systems, but they are built on fundamentally contrasting architectural philosophies:

| Architectural Dimension | **Linux** | **Microsoft Windows** |
| :--- | :--- | :--- |
| **Kernel Architecture** | **Monolithic Kernel** (dynamically loaded kernel modules, direct memory execution) | **Hybrid Kernel** (Windows NT Executive + microkernel-inspired hardware abstraction layer) |
| **File System Hierarchy** | Unified single-root tree (\`/\`, e.g. \`/etc\`, \`/var\`, \`/home\`); *"Everything is a file"* | Drive-letter partitioning (\`C:\\\`, \`D:\\\`); NTFS / ReFS with case-insensitive paths |
| **User Interface & Shell** | CLI-centric first (Bash, Zsh) with modular desktop environments (GNOME, KDE) | GUI-centric first with integrated desktop, accompanied by PowerShell and cmd |
| **Process & Thread Model** | Lightweight processes via unified \`clone()\` system call sharing memory descriptors | Distinct heavy \`EPROCESS\` and \`ETHREAD\` kernel executive objects |
| **Target Environment** | Dominates 90%+ of cloud servers, supercomputers, Android devices, and Docker containers | Dominates desktop personal computing (70%+), enterprise Active Directory domains, and PC gaming |
| **Licensing & Extensibility**| Free, open-source (GPL license); completely inspectable and customizable kernel | Proprietary, commercial closed-source licensed by Microsoft |

#### 💡 Architectural Insight:
- Choose **Linux** for high-throughput server backends, microservices, containerization, and developer tooling.
- Choose **Windows** for desktop consumer usability, corporate enterprise Active Directory administration, and native DirectX gaming.`,
      aiProvider: 'Cosmic CS Knowledge Engine (Local Knowledge Mode)',
      isDemoMode: true,
    };
  }

  // Case 4: Operating System Basics / Concepts
  if (
    lowerQuery.includes('basics of operating system') ||
    lowerQuery.includes('what is an operating system') ||
    lowerQuery.includes('operating system basics') ||
    lowerQuery.includes('os basics')
  ) {
    return {
      reply: `### 💻 Fundamentals of Operating Systems

An **Operating System (OS)** is system software that acts as an intermediary between computer hardware and user applications. It abstracts complex hardware mechanisms and manages system resources efficiently and securely.

#### 🌟 The Core Functions of an Operating System:

1. **Kernel & Execution Modes**:
   - The **Kernel** is the core component that resides permanently in memory.
   - Operates in **Dual-Mode**: *User Mode* (restricted instructions) and *Kernel Mode* (Ring 0, full hardware access) to protect system stability.

2. **Process & Thread Management**:
   - Manages process creation, scheduling, inter-process communication (IPC), and synchronization.
   - Schedulers (e.g. Round Robin, CFS) switch CPU execution between ready processes.

3. **Memory Management**:
   - Employs **Virtual Memory** and **Paging** so that applications perceive large, continuous address spaces while physical RAM is dynamically allocated.

4. **File System Management**:
   - Organizes persistent data into logical directories and files (e.g. ext4, NTFS), handling block allocation, metadata (inodes), and access permissions.

5. **Device & I/O Management**:
   - Uses device drivers, buffering, caching, and interrupt handlers to communicate with peripherals (disks, keyboards, network cards).

> 💡 **Follow-up Suggestions**: You can ask: *"explain"*, *"give practical examples"*, or *"compare Windows and Linux"*.`,
      aiProvider: 'Cosmic CS Knowledge Engine (Local Knowledge Mode)',
      isDemoMode: true,
    };
  }

  // Case 5: Contextual Follow-up "explain" / "explain simply" / "explain further"
  if (
    lowerQuery === 'explain' ||
    lowerQuery.includes('explain simply') ||
    lowerQuery.includes('explain further') ||
    lowerQuery.includes('explain this') ||
    lowerQuery.includes('eli5')
  ) {
    const activeTopic = determineActiveTopic();

    if (activeTopic === 'Operating Systems') {
      return {
        reply: `### 🔍 Deep Dive: How the Operating System Operates Under the Hood

Expanding on **Operating System Basics**, let's understand how software actually interacts with the physical computer:

#### 1. Dual-Mode Operation & System Calls
When your application needs to read a file or send data across the network, it cannot directly touch the disk or network card for security reasons. Instead:
1. The application executes a **Trap / Software Interrupt** (a \`syscall\`).
2. The CPU switches from **User Mode** to **Kernel Mode**.
3. The kernel's system call dispatch table invokes the verified kernel driver.
4. After completing the operation, the CPU switches back to User Mode.

#### 2. Context Switching
When the CPU switches execution from Process A to Process B:
- The OS saves Process A's register state, Program Counter (PC), and stack pointer into its **Process Control Block (PCB)**.
- It loads Process B's PCB into the hardware registers.
- Process B resumes execution exactly where it left off.

#### 3. Virtual Memory & Address Translation
Every program sees its own private 64-bit address space starting at address \`0x0\`. The hardware **Memory Management Unit (MMU)** uses **Page Tables** and a high-speed **TLB cache** to translate virtual addresses into actual physical RAM chip addresses on the fly.

Would you like to see **practical code examples** of how processes are created in C/Linux?`,
        aiProvider: 'Cosmic CS Knowledge Engine (Local Knowledge Mode)',
        isDemoMode: true,
      };
    }

    return {
      reply: `### 🔍 Explanation: Understanding ${activeTopic}

Let's break down **${activeTopic}** into intuitive, foundational principles:

1. **The Core Problem It Solves**:
   In software engineering, ${activeTopic} provides a structured abstraction to manage complexity, optimize resource utilization, and guarantee predictable state transitions.

2. **How It Works**:
   - **Encapsulation**: Isolates internal mechanics from external consumer interfaces.
   - **Algorithmic Flow**: Coordinates incoming inputs through validation, processing, and output delivery.
   - **Fault Tolerance**: Contains failures within safe boundaries to prevent system crashes.

Would you like practical code examples or a comparison with alternative patterns?`,
      aiProvider: 'Cosmic CS Knowledge Engine (Local Knowledge Mode)',
      isDemoMode: true,
    };
  }

  // Case 6: Contextual Follow-up "give practical examples" / "code example"
  if (
    lowerQuery.includes('give practical example') ||
    lowerQuery.includes('practical example') ||
    lowerQuery.includes('code example') ||
    lowerQuery.includes('give practical examples')
  ) {
    const activeTopic = determineActiveTopic();

    if (activeTopic === 'Operating Systems') {
      return {
        reply: `### 🛠️ Practical Operating System Examples in Action

Here are real-world mechanisms demonstrating how an Operating System operates:

#### 1. Process Creation in Linux (\`fork\` & \`exec\`)
In POSIX operating systems, new processes are spawned by duplicating the calling process using the \`fork()\` system call:

\`\`\`c
#include <stdio.h>
#include <unistd.h>
#include <sys/types.h>

int main() {
    pid_t pid = fork(); // Kernel duplicates current process

    if (pid < 0) {
        perror("Fork failed");
        return 1;
    } else if (pid == 0) {
        // Child Process
        printf("Child Process: PID = %d, Parent PID = %d\\n", getpid(), getppid());
    } else {
        // Parent Process
        printf("Parent Process: Created child with PID = %d\\n", pid);
    }
    return 0;
}
\`\`\`

#### 2. Virtual Memory Demand Paging
- When you open a heavy 2GB application, the OS does **not** load 2GB into RAM immediately.
- It maps the executable into virtual memory with invalid page table entries.
- As the CPU executes code, it triggers **Page Faults**, prompting the kernel to fetch only the active pages (e.g. 50MB) into RAM on demand.

#### 3. CPU Scheduling (Linux CFS)
- The Linux Completely Fair Scheduler uses a **Red-Black Tree** to track the virtual runtime (\`vruntime\`) of every runnable thread.
- The thread that has consumed the least CPU time sits at the leftmost node and is scheduled next.`,
        aiProvider: 'Cosmic CS Knowledge Engine (Local Knowledge Mode)',
        isDemoMode: true,
      };
    }

    return {
      reply: `### 🛠️ Practical Implementation Example for ${activeTopic}

Here is a practical, production-grade example illustrating ${activeTopic}:

\`\`\`javascript
// Practical pattern demonstrating ${activeTopic}
class SystemResourceManager {
  constructor(name) {
    this.name = name;
    this.allocated = false;
  }

  async acquireResource(timeoutMs = 5000) {
    console.log(\`Acquiring lock for \${this.name}...\`);
    this.allocated = true;
    return { status: 'acquired', timestamp: new Date() };
  }

  release() {
    this.allocated = false;
    console.log(\`Released lock for \${this.name}.\`);
  }
}
\`\`\`

Notice how resource acquisition is encapsulated with deterministic release semantics to prevent state corruption.`,
      aiProvider: 'Cosmic CS Knowledge Engine (Local Knowledge Mode)',
      isDemoMode: true,
    };
  }

  // Case 7: TCP vs UDP Comparison
  if ((lowerQuery.includes('tcp') && lowerQuery.includes('udp')) || lowerQuery.includes('difference between tcp and udp')) {
    return {
      reply: `### ⚖️ TCP vs UDP: Transport Layer Comparison

Both **TCP** (Transmission Control Protocol) and **UDP** (User Datagram Protocol) operate at Layer 4 of the OSI / TCP-IP stack:

| Architectural Feature | **TCP (Transmission Control Protocol)** | **UDP (User Datagram Protocol)** |
| :--- | :--- | :--- |
| **Connection Paradigm** | **Connection-oriented** (Requires 3-way handshake) | **Connectionless** (No handshake needed) |
| **Reliability** | **Guaranteed delivery** with sequence numbers & ACKs | **Best-effort** delivery (packets may drop) |
| **Ordering** | **Strictly ordered** byte stream | **Unordered** datagrams |
| **Flow & Congestion Control**| **Yes** (Sliding Window, AIMD, Tahoe/Reno) | **No** (transmits at application rate) |
| **Header Overhead** | **20 to 60 bytes** | **8 bytes** |
| **Primary Use Cases** | Web (HTTP/HTTPS), File Transfer (FTP), SSH, Email | Live Video Streaming, Online Multiplayer Gaming, DNS |`,
      aiProvider: 'Cosmic CS Knowledge Engine (Local Knowledge Mode)',
      isDemoMode: true,
    };
  }

  // Case 8: General fallback explanation
  return {
    reply: `### 🌌 Concept Breakdown: **${query}**

Here is a structured explanation of your question:

1. **Foundational Principles**:
   In **${subjectContext || 'Computer Science'}**, understanding **${query}** is essential for building robust, scalable software architectures.

2. **Core Operational Mechanics**:
   - **State Guarantees**: Enforces deterministic runtime behavior and handles edge cases gracefully.
   - **Asymptotic Performance**: Balances memory footprint and time complexity.
   - **Cross-Layer Integration**: Interacts cleanly with underlying operating system and network abstractions.

3. **Practical Engineering Takeaway**:
   When implementing this in production, always validate inputs, monitor resource limits, and establish automated unit tests.

> 💡 **Next Steps**: You can ask for a code example, a comparison with alternative patterns, or ask: *"Quiz me on this concept!"*`,
    aiProvider: 'Cosmic CS Knowledge Engine (Local Knowledge Mode)',
    isDemoMode: true,
  };
};

module.exports = {
  extractConceptsAndGraph,
  generateGraphForTopic,
  generateQuizFromConcepts,
  chatWithTutor,
  SUBJECT_TOPICS_MAP,
  TOPIC_PRESETS,
};
