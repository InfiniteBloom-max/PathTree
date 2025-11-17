from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import json
import asyncio
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import uvicorn

from agents.extraction_agent import ExtractionAgent
from agents.simplifier_agent import SimplifierAgent
from agents.knowledge_tree_agent import KnowledgeTreeAgent
from agents.summary_agent import SummaryAgent
from agents.flashcard_agent import FlashcardAgent
from agents.tutor_agent import TutorAgent
from agents.assessment_agent import AssessmentAgent
from utils.document_processor import DocumentProcessor
from utils.mistral_client import MistralClient

app = FastAPI(title="PathTree API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize agents
mistral_client = MistralClient()
doc_processor = DocumentProcessor()
extraction_agent = ExtractionAgent(mistral_client)
simplifier_agent = SimplifierAgent(mistral_client)
knowledge_tree_agent = KnowledgeTreeAgent(mistral_client)
summary_agent = SummaryAgent(mistral_client)
flashcard_agent = FlashcardAgent(mistral_client)
tutor_agent = TutorAgent(mistral_client)
assessment_agent = AssessmentAgent(mistral_client)

# Pydantic models
class TutorRequest(BaseModel):
    question: str
    context: Optional[str] = None

class QuizRequest(BaseModel):
    topic: str
    difficulty: str = "medium"
    num_questions: int = 10

class GenerateRequest(BaseModel):
    document_id: str
    content: str

# Global storage for processed documents
processed_documents = {}

@app.get("/")
async def root():
    return {"message": "PathTree API is running!"}

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """Upload and process PDF/PPTX documents"""
    try:
        if not file.filename.lower().endswith(('.pdf', '.pptx', '.txt')):
            raise HTTPException(status_code=400, detail="Only PDF, PPTX, and TXT files are supported")
        
        # Save uploaded file temporarily
        temp_path = f"temp_{file.filename}"
        with open(temp_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Process document
        extracted_data = await doc_processor.process_document(temp_path)
        
        # Clean up temp file
        os.remove(temp_path)
        
        # Store processed document
        doc_id = f"doc_{len(processed_documents) + 1}"
        processed_documents[doc_id] = extracted_data
        
        # Extract key information using extraction agent
        extraction_result = await extraction_agent.extract_concepts(extracted_data['raw_text'])
        
        response = {
            "document_id": doc_id,
            "filename": file.filename,
            "topics": extraction_result.get('topics', []),
            "sections": extraction_result.get('sections', []),
            "concept_list": extraction_result.get('concepts', []),
            "raw_text": extracted_data['raw_text'][:1000] + "..." if len(extracted_data['raw_text']) > 1000 else extracted_data['raw_text'],
            "structure_map": extraction_result.get('structure', {}),
            "word_count": len(extracted_data['raw_text'].split()),
            "page_count": extracted_data.get('page_count', 1)
        }
        
        return JSONResponse(content=response)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")

@app.post("/generate/graph")
async def generate_knowledge_graph(request: GenerateRequest):
    """Generate knowledge tree/graph from document"""
    try:
        if request.document_id not in processed_documents:
            raise HTTPException(status_code=404, detail="Document not found")
        
        doc_data = processed_documents[request.document_id]
        graph_data = await knowledge_tree_agent.create_knowledge_tree(doc_data['raw_text'])
        
        return JSONResponse(content=graph_data)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating graph: {str(e)}")

@app.post("/generate/summary")
async def generate_summary(request: GenerateRequest):
    """Generate summaries of different lengths"""
    try:
        if request.document_id not in processed_documents:
            raise HTTPException(status_code=404, detail="Document not found")
        
        doc_data = processed_documents[request.document_id]
        summaries = await summary_agent.generate_summaries(doc_data['raw_text'])
        
        return JSONResponse(content=summaries)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating summary: {str(e)}")

@app.post("/generate/flashcards")
async def generate_flashcards(request: GenerateRequest):
    """Generate flashcards from document"""
    try:
        if request.document_id not in processed_documents:
            raise HTTPException(status_code=404, detail="Document not found")
        
        doc_data = processed_documents[request.document_id]
        flashcards = await flashcard_agent.create_flashcards(doc_data['raw_text'])
        
        return JSONResponse(content={"flashcards": flashcards})
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating flashcards: {str(e)}")

@app.post("/tutor")
async def tutor_chat(request: TutorRequest):
    """Interactive tutor chat"""
    try:
        response = await tutor_agent.answer_question(request.question, request.context)
        return JSONResponse(content=response)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in tutor chat: {str(e)}")

@app.post("/generate/quiz")
async def generate_quiz(request: QuizRequest):
    """Generate quiz/assessment"""
    try:
        quiz_data = await assessment_agent.create_quiz(request.topic, request.difficulty, request.num_questions)
        return JSONResponse(content=quiz_data)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating quiz: {str(e)}")

@app.get("/documents")
async def list_documents():
    """List all processed documents"""
    return JSONResponse(content={
        "documents": [
            {"id": doc_id, "info": doc_data.get('info', {})} 
            for doc_id, doc_data in processed_documents.items()
        ]
    })

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)