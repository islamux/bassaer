import os
import re

content_dir = '/media/islamux/Variety/JavaScriptProjects/bassaer/web/content'

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    new_lines = []
    
    # 1. Clean weird characters and standalone numbers
    cleaned_lines = []
    for line in lines:
        line_clean = line.strip()
        
        # Remove standalone digits (page numbers)
        if re.match(r'^\d+$', line_clean):
            continue
            
        # Remove or replace wingdings/dingbats
        line_clean = line_clean.replace('', '').replace('', '').replace('      ', '').replace('❑', '').replace('', '')
        
        # Replace bullet points
        if line_clean.startswith('•'):
            line_clean = '- ' + line_clean[1:].strip()
            
        line_clean = line_clean.strip()
        if not line_clean:
            cleaned_lines.append("")
        else:
            cleaned_lines.append(line_clean)
            
    # 2. Join fragmented sentences
    joined_lines = []
    current_paragraph = []
    
    terminators = ['.', ':', '؟', '!', '...', '»', '"']
    
    for line in cleaned_lines:
        if not line:
            if current_paragraph:
                joined_lines.append(' '.join(current_paragraph).strip())
                current_paragraph = []
            joined_lines.append("")
            continue
            
        # If it's a heading or list item or blockquote
        if line.startswith('#') or line.startswith('- ') or line.startswith('>'):
            if current_paragraph:
                joined_lines.append(' '.join(current_paragraph).strip())
                current_paragraph = []
            joined_lines.append(line)
            joined_lines.append("")
            continue
            
        # Otherwise it's part of a paragraph
        current_paragraph.append(line)
        
        # Should we end the paragraph here?
        if any(line.endswith(t) for t in terminators):
            joined_lines.append(' '.join(current_paragraph).strip())
            current_paragraph = []

    if current_paragraph:
        joined_lines.append(' '.join(current_paragraph).strip())

    # 3. Clean up multiple empty lines
    final_text = re.sub(r'\n{3,}', '\n\n', '\n'.join(joined_lines))

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(final_text)

for filename in os.listdir(content_dir):
    if filename.endswith('.md'):
        process_file(os.path.join(content_dir, filename))
        
print("Finished formatting markdown files.")
