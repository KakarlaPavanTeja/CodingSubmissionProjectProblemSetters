import json
import sys
import uuid

def generate_ids_for_file(input_file_path):
    """
    Reads a single JSON file from a given path, replaces its ID fields
    with newly generated UUIDs, and prints the result to standard output.
    """
    try:
        with open(input_file_path, 'r', encoding='utf-8') as f:
            input_data = json.load(f)

        # Assuming the main content is the first element in a list
        question_object = input_data[0]

        # 1. Generate and replace the question_id
        new_question_id = str(uuid.uuid4())
        question_object['question']['question_id'] = new_question_id

        # 2. Generate one new code_id and apply it to all code snippets
        new_code_id = str(uuid.uuid4())
        for detail in question_object.get('coding_question_details', []):
            detail['code_id'] = new_code_id

        # 3. Generate a new, unique ID for each test case
        for test_case in question_object.get('test_cases', []):
            test_case['id'] = str(uuid.uuid4())
        
        # Print the updated JSON data to standard output for the Node.js server to capture
        print(json.dumps(input_data, indent=2))

    except FileNotFoundError:
        print(f"Error: The input file was not found.", file=sys.stderr)
        sys.exit(1)
    except (json.JSONDecodeError, IndexError, KeyError) as e:
        print(f"Error processing JSON data: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    # The script expects exactly one argument: the path to the input file.
    if len(sys.argv) != 2:
        print("Usage: python regenerate_ids.py <input_file_path>", file=sys.stderr)
        sys.exit(1)
    
    input_file = sys.argv[1]
    generate_ids_for_file(input_file)

