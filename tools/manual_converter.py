"""
Simple interactive tool to manually create vocabulary JSON
Use this if PDF extraction doesn't work well
"""

import json

def manual_entry():
    """Interactive vocabulary entry"""
    vocabularies = []
    
    print("=" * 60)
    print("✍️  Manual Vocabulary Entry Tool")
    print("=" * 60)
    print("\nEnter vocabulary words one by one.")
    print("Press Ctrl+C when done.\n")
    
    try:
        while True:
            print(f"\n--- Word #{len(vocabularies) + 1} ---")
            
            word = input("Word: ").strip()
            if not word:
                break
            
            pos = input("Part of speech (noun/verb/adj/adv): ").strip() or "noun"
            definition = input("Definition: ").strip()
            example = input("Example sentence (optional): ").strip()
            synonyms = input("Synonyms (optional): ").strip()
            
            vocab = {
                "word": word.lower(),
                "partOfSpeech": pos,
                "definition": definition,
                "examples": [example] if example else [],
                "synonyms": synonyms,
                "ieltsBand": "6.0"
            }
            
            vocabularies.append(vocab)
            print(f"✅ Added! (Total: {len(vocabularies)})")
            
            if len(vocabularies) % 10 == 0:
                save_now = input(f"\n💾 Save {len(vocabularies)} words now? (y/n): ")
                if save_now.lower() == 'y':
                    save_vocabulary(vocabularies)
    
    except KeyboardInterrupt:
        print("\n\n⏸️  Stopped by user")
    
    if vocabularies:
        save_vocabulary(vocabularies)
    
def save_vocabulary(vocabularies):
    """Save vocabulary to JSON"""
    filename = f"vocabulary_{len(vocabularies)}_words.json"
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(vocabularies, f, indent=2, ensure_ascii=False)
    print(f"✅ Saved {len(vocabularies)} words to {filename}")

if __name__ == "__main__":
    manual_entry()
