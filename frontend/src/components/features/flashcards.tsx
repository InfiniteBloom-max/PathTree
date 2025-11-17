'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  RotateCcw, 
  Shuffle, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  X, 
  Star,
  BookOpen,
  Brain
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FlashcardResponse } from '@/lib/api'

interface FlashcardsProps {
  data: FlashcardResponse
  className?: string
}

interface FlashcardState {
  currentIndex: number
  isFlipped: boolean
  showAnswer: boolean
  correctAnswers: number
  incorrectAnswers: number
  studiedCards: Set<string>
  difficulty: 'all' | 'easy' | 'medium' | 'hard'
  category: 'all' | 'concept' | 'definition' | 'application' | 'analysis'
}

export function Flashcards({ data, className }: FlashcardsProps) {
  const [state, setState] = useState<FlashcardState>({
    currentIndex: 0,
    isFlipped: false,
    showAnswer: false,
    correctAnswers: 0,
    incorrectAnswers: 0,
    studiedCards: new Set(),
    difficulty: 'all',
    category: 'all'
  })

  const filteredCards = data.flashcards.filter(card => {
    const difficultyMatch = state.difficulty === 'all' || card.difficulty === state.difficulty
    const categoryMatch = state.category === 'all' || card.category === state.category
    return difficultyMatch && categoryMatch
  })

  const currentCard = filteredCards[state.currentIndex]
  const totalCards = filteredCards.length
  const progress = totalCards > 0 ? ((state.currentIndex + 1) / totalCards) * 100 : 0

  const handleFlip = () => {
    setState(prev => ({
      ...prev,
      isFlipped: !prev.isFlipped,
      showAnswer: !prev.showAnswer
    }))
  }

  const handleNext = () => {
    if (state.currentIndex < totalCards - 1) {
      setState(prev => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
        isFlipped: false,
        showAnswer: false
      }))
    }
  }

  const handlePrevious = () => {
    if (state.currentIndex > 0) {
      setState(prev => ({
        ...prev,
        currentIndex: prev.currentIndex - 1,
        isFlipped: false,
        showAnswer: false
      }))
    }
  }

  const handleCorrect = () => {
    setState(prev => ({
      ...prev,
      correctAnswers: prev.correctAnswers + 1,
      studiedCards: new Set([...prev.studiedCards, currentCard.id])
    }))
    setTimeout(handleNext, 500)
  }

  const handleIncorrect = () => {
    setState(prev => ({
      ...prev,
      incorrectAnswers: prev.incorrectAnswers + 1,
      studiedCards: new Set([...prev.studiedCards, currentCard.id])
    }))
    setTimeout(handleNext, 500)
  }

  const handleShuffle = () => {
    // This would shuffle the cards array
    setState(prev => ({
      ...prev,
      currentIndex: 0,
      isFlipped: false,
      showAnswer: false
    }))
  }

  const handleReset = () => {
    setState(prev => ({
      ...prev,
      currentIndex: 0,
      isFlipped: false,
      showAnswer: false,
      correctAnswers: 0,
      incorrectAnswers: 0,
      studiedCards: new Set()
    }))
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'definition': return <BookOpen className="h-3 w-3" />
      case 'application': return <Brain className="h-3 w-3" />
      case 'analysis': return <Star className="h-3 w-3" />
      default: return <BookOpen className="h-3 w-3" />
    }
  }

  if (!data.flashcards || data.flashcards.length === 0) {
    return (
      <Card className={cn("w-full h-96 flex items-center justify-center", className)}>
        <CardContent>
          <div className="text-center text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No flashcards available</p>
            <p className="text-sm">Generate flashcards from your document first</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (totalCards === 0) {
    return (
      <Card className={cn("w-full h-96 flex items-center justify-center", className)}>
        <CardContent>
          <div className="text-center text-muted-foreground">
            <p>No flashcards match the current filters</p>
            <Button 
              variant="outline" 
              onClick={() => setState(prev => ({ ...prev, difficulty: 'all', category: 'all' }))}
              className="mt-2"
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("w-full max-w-4xl mx-auto", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Flashcards</h2>
          <p className="text-muted-foreground">
            {state.currentIndex + 1} of {totalCards} cards
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleShuffle}>
            <Shuffle className="h-4 w-4 mr-2" />
            Shuffle
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{state.correctAnswers}</div>
            <div className="text-sm text-muted-foreground">Correct</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{state.incorrectAnswers}</div>
            <div className="text-sm text-muted-foreground">Incorrect</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{state.studiedCards.size}</div>
            <div className="text-sm text-muted-foreground">Studied</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Difficulty:</span>
          <select
            value={state.difficulty}
            onChange={(e) => setState(prev => ({ 
              ...prev, 
              difficulty: e.target.value as any,
              currentIndex: 0 
            }))}
            className="text-sm border rounded px-2 py-1"
          >
            <option value="all">All</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Category:</span>
          <select
            value={state.category}
            onChange={(e) => setState(prev => ({ 
              ...prev, 
              category: e.target.value as any,
              currentIndex: 0 
            }))}
            className="text-sm border rounded px-2 py-1"
          >
            <option value="all">All</option>
            <option value="concept">Concept</option>
            <option value="definition">Definition</option>
            <option value="application">Application</option>
            <option value="analysis">Analysis</option>
          </select>
        </div>
      </div>

      {/* Flashcard */}
      <div className="relative mb-6">
        <Card 
          className={cn(
            "h-80 cursor-pointer transition-all duration-300 transform hover:scale-105",
            state.isFlipped && "rotate-y-180"
          )}
          onClick={handleFlip}
        >
          <CardContent className="p-8 h-full flex flex-col justify-center">
            {!state.showAnswer ? (
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <Badge className={getDifficultyColor(currentCard.difficulty)}>
                    {currentCard.difficulty}
                  </Badge>
                  <Badge variant="outline" className="ml-2">
                    {getCategoryIcon(currentCard.category)}
                    <span className="ml-1">{currentCard.category}</span>
                  </Badge>
                </div>
                <h3 className="text-xl font-semibold mb-4">Question</h3>
                <p className="text-lg leading-relaxed">{currentCard.question}</p>
                <p className="text-sm text-muted-foreground mt-6">
                  Click to reveal answer
                </p>
              </div>
            ) : (
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-4 text-green-600">Answer</h3>
                <p className="text-lg leading-relaxed mb-6">{currentCard.answer}</p>
                <div className="flex items-center justify-center space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleIncorrect()
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Incorrect
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCorrect()
                    }}
                    className="text-green-600 hover:text-green-700"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Correct
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={state.currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex items-center space-x-2">
          {currentCard.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <Button
          variant="outline"
          onClick={handleNext}
          disabled={state.currentIndex === totalCards - 1}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}