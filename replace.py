import os

TARGET_STRING = 'http://pidisp:5001'
REPLACEMENT_STRING = '${HOSTNAME}:${DBPORT}'
ENV_DECLARATIONS = [
    'const HOSTNAME = process.env.HOSTNAME;',
    'const DBPORT = process.env.DBPORT;'
]

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        original_content = f.read()

    if TARGET_STRING not in original_content:
        return False  # No change needed

    # Perform replacement
    updated_content = original_content.replace(TARGET_STRING, f'`{REPLACEMENT_STRING}`')

    # Add env declarations if not already present
    if not any(decl in updated_content for decl in ENV_DECLARATIONS):
        updated_content = '\n'.join(ENV_DECLARATIONS) + '\n' + updated_content

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(updated_content)

    return True  # File was changed

def scan_directory(start_path):
    modified_files = []
    for root, _, files in os.walk(start_path):
        for file in files:
            if file.endswith('.js'):
                full_path = os.path.join(root, file)
                if process_file(full_path):
                    modified_files.append(full_path)

    if modified_files:
        print("\nFiles modified:")
        for file in modified_files:
            print(f" - {file}")
    else:
        print("No files needed modification.")

if __name__ == '__main__':
    # Change '.' to another folder path if needed
    scan_directory('.')
