'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Upload, 
  FileText, 
  Brain, 
  BookOpen, 
  MessageCircle, 
  Target,
  TrendingUp,
  Clock,
  Star,
  Zap,
  ArrowRight,
  Plus
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FileUpload } from './file-upload'
import { KnowledgeTree } from './knowledge-tree'
import { Flashcards } from './flashcards'
import { TutorChat } from './tutor-chat'
import { 
  DocumentUploadResponse, 
  KnowledgeGraphResponse, 
  FlashcardResponse,
  SummaryResponse,
  generateKnowledgeGraph,
  generateFlashcards,
  generateSummary
} from '@/lib/api'

interface DashboardState {
  currentView: 'upload' | 'knowledge-tree' | 'summaries' | 'flashcards' | 'tutor'
  document: DocumentUploadResponse | null
  knowledgeGraph: KnowledgeGraphResponse | null
  flashcards: FlashcardResponse | null
  summaries: SummaryResponse | null
  isGenerating: boolean
  generationProgress: number
}

interface DashboardProps {
  className?: string
}

export function Dashboard({ className }: DashboardProps) {
  const [state, setState] = useState<DashboardState>({
    currentView: 'upload',
    document: null,
    knowledgeGraph: null,
    flashcards: null,
    summaries: null,
    isGenerating: false,
    generationProgress: 0
  })

  const handleUploadComplete = async (document: DocumentUploadResponse) => {
    setState(prev => ({ ...prev, document, isGenerating: true, generationProgress: 0 }))
    
    try {
      // Generate all content in parallel
      const progressInterval = setInterval(() => {
        setState(prev => ({
          ...prev,
          generationProgress: Math.min(prev.generationProgress + 10, 90)
        }))
      }, 500)

      const [knowledgeGraph, flashcards, summaries] = await Promise.all([
        generateKnowledgeGraph(document.document_id, document.raw_text),
        generateFlashcards(document.document_id, document.raw_text),
        generateSummary(document.document_id, document.raw_text)
      ])

      clearInterval(progressInterval)
      
      setState(prev => ({
        ...prev,
        knowledgeGraph,
        flashcards,
        summaries,
        isGenerating: false,
        generationProgress: 100,
        currentView: 'knowledge-tree'
      }))

    } catch (error) {
      console.error('Error generating content:', error)
      setState(prev => ({
        ...prev,
        isGenerating: false,
        generationProgress: 0
      }))
    }
  }

  const handleViewChange = (view: DashboardState['currentView']) => {
    setState(prev => ({ ...prev, currentView: view }))
  }

  const getViewTitle = () => {
    switch (state.currentView) {
      case 'upload': return 'Upload Document'
      case 'knowledge-tree': return 'Knowledge Tree'
      case 'summaries': return 'Summaries'
      case 'flashcards': return 'Flashcards'
      case 'tutor': return 'AI Tutor'
      default: return 'PathTree'
    }
  }

  const renderNavigation = () => (
    <div className="flex items-center space-x-2 mb-6 overflow-x-auto">
      <Button
        variant={state.currentView === 'upload' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleViewChange('upload')}
        className="flex items-center space-x-2 whitespace-nowrap"
      >
        <Upload className="h-4 w-4" />
        <span>Upload</span>
      </Button>
      
      {state.document && (
        <>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <Button
            variant={state.currentView === 'knowledge-tree' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleViewChange('knowledge-tree')}
            disabled={!state.knowledgeGraph}
            className="flex items-center space-x-2 whitespace-nowrap"
          >
            <Brain className="h-4 w-4" />
            <span>Knowledge Tree</span>
          </Button>
          
          <Button
            variant={state.currentView === 'summaries' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleViewChange('summaries')}
            disabled={!state.summaries}
            className="flex items-center space-x-2 whitespace-nowrap"
          >
            <FileText className="h-4 w-4" />
            <span>Summaries</span>
          </Button>
          
          <Button
            variant={state.currentView === 'flashcards' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleViewChange('flashcards')}
            disabled={!state.flashcards}
            className="flex items-center space-x-2 whitespace-nowrap"
          >
            <BookOpen className="h-4 w-4" />
            <span>Flashcards</span>
          </Button>
          
          <Button
            variant={state.currentView === 'tutor' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleViewChange('tutor')}
            className="flex items-center space-x-2 whitespace-nowrap"
          >
            <MessageCircle className="h-4 w-4" />
            <span>AI Tutor</span>
          </Button>
        </>
      )}
    </div>
  )

  const renderDocumentInfo = () => {
    if (!state.document) return null

    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-semibold">{state.document.filename}</h3>
                  <p className="text-sm text-muted-foreground">
                    {state.document.word_count} words • {state.document.page_count} pages
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">
                {state.document.topics.length} topics
              </Badge>
              <Badge variant="secondary">
                {state.document.concept_list.length} concepts
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderGenerationProgress = () => {
    if (!state.isGenerating) return null

    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Zap className="h-8 w-8 text-blue-600 animate-pulse" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Generating AI Content</h3>
            <p className="text-muted-foreground mb-4">
              Creating knowledge tree, flashcards, and summaries...
            </p>
            <Progress value={state.generationProgress} className="mb-2" />
            <p className="text-sm text-muted-foreground">
              {state.generationProgress}% complete
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderQuickStats = () => {
    if (!state.document) return null

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <Brain className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">
              {state.knowledgeGraph?.nodes.length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Knowledge Nodes</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">
              {state.flashcards?.flashcards.length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Flashcards</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">
              {state.summaries ? Object.keys(state.summaries).length : 0}
            </div>
            <div className="text-sm text-muted-foreground">Summaries</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold">
              {state.document.topics.length}
            </div>
            <div className="text-sm text-muted-foreground">Topics</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderMainContent = () => {
    switch (state.currentView) {
      case 'upload':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold gradient-joy bg-clip-text text-transparent mb-4">
                PathTree
              </h1>
              <p className="text-xl text-muted-foreground">
                Transform your documents into interactive knowledge trees
              </p>
            </div>
            <FileUpload onUploadComplete={handleUploadComplete} />
          </div>
        )
      
      case 'knowledge-tree':
        return state.knowledgeGraph ? (
          <KnowledgeTree data={state.knowledgeGraph} />
        ) : (
          <div className="text-center py-12">
            <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p>Knowledge tree is being generated...</p>
          </div>
        )
      
      case 'summaries':
        return state.summaries ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Document Summaries</h2>
            
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="leading-relaxed">{state.summaries.one_page}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="leading-relaxed">{state.summaries.five_page}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Key Points</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {state.summaries.bullet_points.map((point, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p>Summaries are being generated...</p>
          </div>
        )
      
      case 'flashcards':
        return state.flashcards ? (
          <Flashcards data={state.flashcards} />
        ) : (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p>Flashcards are being generated...</p>
          </div>
        )
      
      case 'tutor':
        return (
          <TutorChat context={state.document?.raw_text} />
        )
      
      default:
        return null
    }
  }

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-blue-50 to-purple-50", className)}>
      <div className="container mx-auto px-4 py-8">
        {renderNavigation()}
        {renderDocumentInfo()}
        {renderGenerationProgress()}
        {renderQuickStats()}
        {renderMainContent()}
      </div>
    </div>
  )
}