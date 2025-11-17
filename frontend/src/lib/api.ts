import { apiCall } from './utils'

export interface DocumentUploadResponse {
  document_id: string
  filename: string
  topics: string[]
  sections: Array<{ title: string; content_preview: string }>
  concept_list: Array<{ term: string; definition: string }>
  raw_text: string
  structure_map: any
  word_count: number
  page_count: number
}

export interface KnowledgeGraphResponse {
  nodes: Array<{
    id: string
    type: 'root' | 'branch' | 'leaf'
    data: {
      label: string
      description: string
      level: number
    }
    position: { x: number; y: number }
  }>
  edges: Array<{
    id: string
    source: string
    target: string
    type: string
  }>
  layout: string
}

export interface SummaryResponse {
  one_page: string
  five_page: string
  bullet_points: string[]
  chapters: Array<{
    chapter: string
    title: string
    summary: string
  }>
}

export interface FlashcardResponse {
  flashcards: Array<{
    id: string
    question: string
    answer: string
    difficulty: 'easy' | 'medium' | 'hard'
    category: string
    tags: string[]
  }>
}

export interface TutorResponse {
  explanation: string
  examples: string[]
  practice_questions: Array<{
    question: string
    hint: string
  }>
  tips: string[]
  summary: string[]
  difficulty_level: string
  related_topics: string[]
  response_type: string
}

export interface QuizResponse {
  quiz_title: string
  difficulty: string
  total_points: number
  time_limit: string
  questions: Array<{
    id: string
    type: 'multiple_choice' | 'short_answer' | 'true_false'
    question: string
    options?: string[]
    correct_answer: string
    explanation: string
    points: number
    difficulty: string
  }>
}

// API Functions
export async function uploadDocument(file: File): Promise<DocumentUploadResponse> {
  const formData = new FormData()
  formData.append('file', file)

  return apiCall('/upload', {
    method: 'POST',
    body: formData,
    headers: {}, // Remove Content-Type to let browser set it with boundary
  })
}

export async function generateKnowledgeGraph(documentId: string, content: string): Promise<KnowledgeGraphResponse> {
  return apiCall('/generate/graph', {
    method: 'POST',
    body: JSON.stringify({
      document_id: documentId,
      content: content
    })
  })
}

export async function generateSummary(documentId: string, content: string): Promise<SummaryResponse> {
  return apiCall('/generate/summary', {
    method: 'POST',
    body: JSON.stringify({
      document_id: documentId,
      content: content
    })
  })
}

export async function generateFlashcards(documentId: string, content: string): Promise<FlashcardResponse> {
  return apiCall('/generate/flashcards', {
    method: 'POST',
    body: JSON.stringify({
      document_id: documentId,
      content: content
    })
  })
}

export async function askTutor(question: string, context?: string): Promise<TutorResponse> {
  return apiCall('/tutor', {
    method: 'POST',
    body: JSON.stringify({
      question: question,
      context: context
    })
  })
}

export async function generateQuiz(topic: string, difficulty: string = 'medium', numQuestions: number = 10): Promise<QuizResponse> {
  return apiCall('/generate/quiz', {
    method: 'POST',
    body: JSON.stringify({
      topic: topic,
      difficulty: difficulty,
      num_questions: numQuestions
    })
  })
}

export async function getDocuments(): Promise<{ documents: Array<{ id: string; info: any }> }> {
  return apiCall('/documents')
}