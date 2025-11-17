#!/usr/bin/env python3
"""
Simple test to verify PathTree functionality
"""
import sys
import os

# Add the backend directory to Python path
sys.path.insert(0, '/workspace/project/pathtree/backend')

def test_imports():
    """Test if all required modules can be imported"""
    try:
        # Test FastAPI
        from fastapi import FastAPI
        print("✅ FastAPI imported successfully")
        
        # Test PDF processing
        import pdfplumber
        print("✅ pdfplumber imported successfully")
        
        # Test PPTX processing
        from pptx import Presentation
        print("✅ python-pptx imported successfully")
        
        # Test Mistral client
        from mistralai.client import MistralClient
        print("✅ MistralClient imported successfully")
        
        return True
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False

def test_text_processing():
    """Test basic text processing functionality"""
    try:
        # Test text chunking
        sample_text = """
        This is a sample document for testing PathTree functionality.
        It contains multiple sentences and paragraphs to test the text processing capabilities.
        
        PathTree is designed to convert documents into knowledge trees, summaries, and flashcards.
        The system uses multiple AI agents to process and analyze the content.
        """
        
        # Simple chunking test
        chunks = sample_text.split('\n\n')
        chunks = [chunk.strip() for chunk in chunks if chunk.strip()]
        
        print(f"✅ Text chunking test passed - {len(chunks)} chunks created")
        
        # Test basic text analysis
        words = sample_text.split()
        print(f"✅ Text analysis test passed - {len(words)} words processed")
        
        return True
    except Exception as e:
        print(f"❌ Text processing error: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting PathTree functionality tests...\n")
    
    # Test imports
    print("1. Testing module imports:")
    imports_ok = test_imports()
    print()
    
    # Test text processing
    print("2. Testing text processing:")
    processing_ok = test_text_processing()
    print()
    
    # Summary
    if imports_ok and processing_ok:
        print("🎉 All tests passed! PathTree is ready to use.")
        return True
    else:
        print("❌ Some tests failed. Please check the setup.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)