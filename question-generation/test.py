from pprint import pprint
import main

payload = {
    "input_text": "Dylan's mum left on saturday"
}

mcq_gen = main.Question_Generator()

output = mcq_gen.generate_MCQs(payload)

pprint(output)
