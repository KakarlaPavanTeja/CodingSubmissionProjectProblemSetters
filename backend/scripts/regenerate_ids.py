import json
import sys
import uuid
import os

def generate_ids_for_file(input_file_path):
    """
    Reads a single JSON file from a given path, replaces its ID fields 
    with newly generated UUIDs, and prints the result to standard output.
    """
    try:
        with open(input_file_path, 'r', encoding='utf-8') as f:
            input_data = json.load(f)

        # Assuming the main content is the first element in a list
        if not isinstance(input_data, list) or not input_data:
            raise ValueError("Invalid JSON structure: Expected a non-empty list.")
            
        question_object = input_data[0]

        # 1. Generate and replace the question_id
        if 'question' in question_object and 'question_id' in question_object['question']:
            question_object['question']['question_id'] = str(uuid.uuid4())

        # 2. Generate one new code_id and apply it to all code snippets
        if 'coding_question_details' in question_object:
            new_code_id = str(uuid.uuid4())
            for detail in question_object.get('coding_question_details', []):
                detail['code_id'] = new_code_id

        # 3. Generate a new, unique ID for each test case
        if 'test_cases' in question_object:
            for test_case in question_object.get('test_cases', []):
                test_case['id'] = str(uuid.uuid4())
        
        # Print the updated data as a JSON string to standard output
        print(json.dumps(input_data, indent=2))

    except FileNotFoundError:
        print(f"Error: The input file was not found.", file=sys.stderr)
        sys.exit(1)
    except (json.JSONDecodeError, IndexError, KeyError, ValueError) as e:
        print(f"Error processing JSON data: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"An unexpected error occurred: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python regenerate_ids.py <input_file_path>", file=sys.stderr)
        sys.exit(1)
    
    input_file = sys.argv[1]
    generate_ids_for_file(input_file)
