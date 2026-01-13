"""
Script to convert IELTS vocabulary PDF to JSON format
Supports various PDF formats
"""

import PyPDF2
import json
import re

def extract_vocabulary_from_pdf(pdf_path, output_path='vocabulary.json'):
    """
    Extract vocabulary from PDF and convert to JSON
    
    Expected PDF format (flexible):
    - Word
    - Part of speech
    - Definition
    - Example (optional)
    """
    
    vocabularies = []
    
    try:
        # Open PDF
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            
            # Extract all text
            for page in pdf_reader.pages:
                text += page.extract_text()
        
        print(f"✅ PDF loaded successfully!")
        print(f"📄 Total characters extracted: {len(text)}")
        
        # Save raw text for manual checking
        with open('extracted_text.txt', 'w', encoding='utf-8') as f:
            f.write(text)
        print("✅ Raw text saved to 'extracted_text.txt' for your review")
        
        # Basic parsing (you may need to adjust based on your PDF format)
        lines = text.split('\n')
        current_word = {}
        
        for i, line in enumerate(lines):
            line = line.strip()
            if not line:
                continue
            
            # Try to detect word entries (customize based on your PDF)
            # This is a basic example - you'll need to adjust
            if re.match(r'^[A-Za-z-]+$', line) and len(line) > 2:
                # Likely a word
                if current_word and 'word' in current_word:
                    vocabularies.append(current_word)
                
                current_word = {
                    'word': line.lower(),
                    'partOfSpeech': 'unknown',
                    'definition': '',
                    'examples': [],
                    'synonyms': '',
                    'ieltsBand': '6.0'
                }
            
            # Try to detect part of speech
            elif re.match(r'\b(noun|verb|adjective|adverb|preposition)\b', line, re.I):
                if current_word:
                    current_word['partOfSpeech'] = line
            
            # Otherwise treat as definition or example
            elif current_word and 'word' in current_word:
                if not current_word['definition']:
                    current_word['definition'] = line
                else:
                    current_word['examples'].append(line)
        
        # Add last word
        if current_word and 'word' in current_word:
            vocabularies.append(current_word)
        
        # Save to JSON
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(vocabularies, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Conversion complete!")
        print(f"📊 Total words extracted: {len(vocabularies)}")
        print(f"💾 Saved to: {output_path}")
        
        # Show sample
        if vocabularies:
            print("\n📖 Sample (first word):")
            print(json.dumps(vocabularies[0], indent=2))
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("=" * 60)
    print("🔧 IELTS Vocabulary PDF to JSON Converter")
    print("=" * 60)
    
    pdf_file = input("\n📁 Enter PDF file path: ").strip()
    
    if pdf_file:
        extract_vocabulary_from_pdf(pdf_file)
    else:
        print("❌ No file path provided")
