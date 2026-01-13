"""
Automatic PDF to MySQL Database Importer
Reads PDF vocabulary file and imports directly to database
"""

import PyPDF2
import mysql.connector
import re
from typing import List, Dict
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('../backend/.env')

class VocabularyImporter:
    def __init__(self):
        """Initialize database connection"""
        self.conn = mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            port=int(os.getenv('DB_PORT', 3306)),
            user=os.getenv('DB_USERNAME', 'root'),
            password=os.getenv('DB_PASSWORD', ''),
            database=os.getenv('DB_DATABASE', 'ielts_vocabulary')
        )
        self.cursor = self.conn.cursor()
        print("✅ Connected to database!")
    
    def extract_from_pdf(self, pdf_path: str) -> List[Dict]:
        """Extract vocabulary from PDF"""
        print(f"\n📖 Reading PDF: {pdf_path}")
        
        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                all_text = ""
                
                print(f"📄 Total pages: {len(pdf_reader.pages)}")
                
                for i, page in enumerate(pdf_reader.pages):
                    all_text += page.extract_text()
                    if (i + 1) % 10 == 0:
                        print(f"   Processed {i + 1}/{len(pdf_reader.pages)} pages...")
                
                print(f"✅ Extracted {len(all_text)} characters")
                
                # Save raw text for debugging
                with open('extracted_raw_text.txt', 'w', encoding='utf-8') as f:
                    f.write(all_text)
                print("💾 Saved raw text to 'extracted_raw_text.txt'")
                
                return self.parse_vocabulary(all_text)
        
        except Exception as e:
            print(f"❌ Error reading PDF: {e}")
            return []
    
    def parse_vocabulary(self, text: str) -> List[Dict]:
        """
        Parse vocabulary from text
        This is a SMART parser that works with various formats
        """
        vocabularies = []
        lines = text.split('\n')
        
        print(f"\n🔍 Parsing {len(lines)} lines...")
        
        current_entry = {}
        word_count = 0
        
        for i, line in enumerate(lines):
            line = line.strip()
            
            if not line:
                continue
            
            # Detection 1: Word (usually starts with capital or all lowercase, 2-20 chars)
            word_match = re.match(r'^([a-zA-Z\-]{2,20})$', line)
            if word_match:
                # Save previous entry
                if current_entry and 'word' in current_entry and current_entry.get('definition'):
                    vocabularies.append(current_entry)
                    word_count += 1
                    if word_count % 100 == 0:
                        print(f"   Found {word_count} words...")
                
                # Start new entry
                current_entry = {
                    'word': word_match.group(1).lower(),
                    'part_of_speech': 'noun',
                    'definition': '',
                    'example_sentences': [],
                    'synonyms': '',
                    'ipa_uk': '',
                    'ielts_band': '6.0'
                }
                continue
            
            # Detection 2: Part of speech
            pos_match = re.search(r'\b(noun|verb|adjective|adverb|adj\.|n\.|v\.|adv\.)\b', line, re.I)
            if pos_match and current_entry:
                pos = pos_match.group(1).lower()
                if pos.startswith('n'): current_entry['part_of_speech'] = 'noun'
                elif pos.startswith('v'): current_entry['part_of_speech'] = 'verb'
                elif pos.startswith('adj'): current_entry['part_of_speech'] = 'adjective'
                elif pos.startswith('adv'): current_entry['part_of_speech'] = 'adverb'
                continue
            
            # Detection 3: IPA pronunciation
            ipa_match = re.search(r'/[^/]+/', line)
            if ipa_match and current_entry:
                current_entry['ipa_uk'] = ipa_match.group(0)
                continue
            
            # Detection 4: Synonyms (words: ... or syn: ...)
            if re.match(r'(synonym|syn\.|similar):', line, re.I) and current_entry:
                current_entry['synonyms'] = re.sub(r'^(synonym|syn\.|similar):\s*', '', line, flags=re.I)
                continue
            
            # Detection 5: Example (starts with E.g., Example:, or contains quotes)
            if re.match(r'(e\.g\.|example|ex\.)', line, re.I) or '"' in line:
                if current_entry and 'example_sentences' in current_entry:
                    example = re.sub(r'^(e\.g\.|example|ex\.)\s*', '', line, flags=re.I)
                    current_entry['example_sentences'].append(example.strip('"'))
                continue
            
            # Detection 6: Definition (longer text, not matching above)
            if current_entry and 'word' in current_entry and len(line) > 10:
                if not current_entry['definition']:
                    current_entry['definition'] = line
                elif len(line) > 20:  # Could be additional definition or example
                    current_entry['example_sentences'].append(line)
        
        # Add last entry
        if current_entry and 'word' in current_entry and current_entry.get('definition'):
            vocabularies.append(current_entry)
            word_count += 1
        
        print(f"✅ Parsed {word_count} vocabulary entries")
        
        return vocabularies
    
    def import_to_database(self, vocabularies: List[Dict]):
        """Import vocabulary list to MySQL database"""
        print(f"\n💾 Importing {len(vocabularies)} words to database...")
        
        insert_query = """
        INSERT INTO vocabularies 
        (word, part_of_speech, ipa_uk, definition, example_sentences, synonyms, ielts_band)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
        definition = VALUES(definition),
        example_sentences = VALUES(example_sentences)
        """
        
        imported = 0
        skipped = 0
        
        for vocab in vocabularies:
            try:
                # Convert example_sentences to JSON string
                import json
                examples_json = json.dumps(vocab.get('example_sentences', []))
                
                self.cursor.execute(insert_query, (
                    vocab['word'],
                    vocab.get('part_of_speech', 'noun'),
                    vocab.get('ipa_uk', ''),
                    vocab.get('definition', ''),
                    examples_json,
                    vocab.get('synonyms', ''),
                    vocab.get('ielts_band', '6.0')
                ))
                
                imported += 1
                if imported % 100 == 0:
                    print(f"   Imported {imported}/{len(vocabularies)}...")
                    self.conn.commit()  # Commit every 100 words
            
            except Exception as e:
                skipped += 1
                if skipped <= 5:  # Only show first 5 errors
                    print(f"⚠️  Skipped '{vocab.get('word', '?')}': {e}")
        
        self.conn.commit()
        print(f"\n✅ Import complete!")
        print(f"   ✅ Successfully imported: {imported}")
        print(f"   ⚠️  Skipped: {skipped}")
    
    def close(self):
        """Close database connection"""
        self.cursor.close()
        self.conn.close()
        print("\n👋 Database connection closed")

def main():
    print("=" * 70)
    print("🚀 IELTS Vocabulary PDF to MySQL Importer")
    print("=" * 70)
    
    pdf_path = input("\n📁 Enter PDF file path: ").strip().strip('"')
    
    if not pdf_path or not pdf_path.endswith('.pdf'):
        print("❌ Invalid PDF file path")
        return
    
    if not os.path.exists(pdf_path):
        print(f"❌ File not found: {pdf_path}")
        return
    
    try:
        importer = VocabularyImporter()
        
        # Extract from PDF
        vocabularies = importer.extract_from_pdf(pdf_path)
        
        if not vocabularies:
            print("\n❌ No vocabulary entries found!")
            print("💡 Please check 'extracted_raw_text.txt' to see what was extracted")
            print("💡 You may need to adjust the parser for your PDF format")
            return
        
        # Show sample
        print(f"\n📖 Sample entries:")
        for i, vocab in enumerate(vocabularies[:3]):
            print(f"\n{i+1}. {vocab['word']} ({vocab['part_of_speech']})")
            print(f"   Definition: {vocab['definition'][:80]}...")
        
        # Confirm import
        confirm = input(f"\n❓ Import {len(vocabularies)} words to database? (yes/no): ")
        
        if confirm.lower() in ['yes', 'y']:
            importer.import_to_database(vocabularies)
        else:
            print("❌ Import cancelled")
        
        importer.close()
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
