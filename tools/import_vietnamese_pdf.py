"""
Custom PDF to MySQL Importer for Vietnamese IELTS Vocabulary Format
Optimized for format: "word pos /ipa/ vietnamese_meaning"
"""

import PyPDF2
import mysql.connector
import re
from typing import List, Dict
import os
from dotenv import load_dotenv
import json

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
    
    def extract_from_pdf(self, pdf_path: str) -> str:
        """Extract text from PDF"""
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
                
                return all_text
        
        except Exception as e:
            print(f"❌ Error reading PDF: {e}")
            return ""
    
    def parse_vocabulary(self, text: str) -> List[Dict]:
        """
        Parse vocabulary from Vietnamese IELTS format
        Format: word pos /ipa/ vietnamese_definition
        Example: abandon v. /ə'bændən / bỏ, từ bỏ
        """
        vocabularies = []
        lines = text.split('\n')
        
        print(f"\n🔍 Parsing {len(lines)} lines...")
        
        # Part of speech mapping
        pos_mapping = {
            'n.': 'noun',
            'v.': 'verb',
            'adj.': 'adjective',
            'adv.': 'adverb',
            'prep.': 'preposition',
            'conj.': 'conjunction',
            'pron.': 'pronoun',
            'interj.': 'interjection',
        }
        
        word_count = 0
        
        for line in lines:
            line = line.strip()
            
            if not line or len(line) < 10:
                continue
            
            # Pattern: word + pos + /ipa/ + vietnamese_meaning
            # Example: abandon v. /ə'bændən / bỏ, từ bỏ
            pattern = r'^([a-zA-Z\-]+)\s+(n\.|v\.|adj\.|adv\.|prep\.|conj\.|pron\.|interj\.|)\s*(/[^/]+/)?\s*(.+)$'
            match = re.match(pattern, line)
            
            if match:
                word = match.group(1).strip().lower()
                pos_short = match.group(2).strip() if match.group(2) else 'n.'
                ipa = match.group(3).strip() if match.group(3) else ''
                vietnamese_def = match.group(4).strip()
                
                # Convert pos to full form
                pos_full = pos_mapping.get(pos_short, 'noun')
                
                # Create English definition from Vietnamese
                # For now, we'll use Vietnamese as definition
                # You can use translation API later if needed
                definition = f"{vietnamese_def}"
                
                vocab = {
                    'word': word,
                    'part_of_speech': pos_full,
                    'ipa_uk': ipa,
                    'definition': definition,
                    'example_sentences': [],
                    'synonyms': '',
                    'ielts_band': '6.0'
                }
                
                vocabularies.append(vocab)
                word_count += 1
                
                if word_count % 500 == 0:
                    print(f"   Found {word_count} words...")
        
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
        ipa_uk = VALUES(ipa_uk),
        part_of_speech = VALUES(part_of_speech)
        """
        
        imported = 0
        skipped = 0
        
        for vocab in vocabularies:
            try:
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
                    self.conn.commit()
            
            except Exception as e:
                skipped += 1
                if skipped <= 5:
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
    print("🚀 Vietnamese IELTS Vocabulary Importer")
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
        text = importer.extract_from_pdf(pdf_path)
        
        if not text:
            print("\n❌ Failed to extract text from PDF")
            return
        
        # Parse vocabulary
        vocabularies = importer.parse_vocabulary(text)
        
        if not vocabularies:
            print("\n❌ No vocabulary entries found!")
            print("💡 Please check 'extracted_raw_text.txt'")
            return
        
        # Show sample
        print(f"\n📖 Sample entries:")
        for i, vocab in enumerate(vocabularies[:5]):
            print(f"\n{i+1}. {vocab['word']} ({vocab['part_of_speech']})")
            print(f"   IPA: {vocab['ipa_uk']}")
            print(f"   Definition: {vocab['definition'][:60]}...")
        
        # Confirm import
        print(f"\n{'='*70}")
        confirm = input(f"❓ Import {len(vocabularies)} words to database? (yes/no): ")
        
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
