import os
import sys
import time
import numpy
from strsimpy.normalized_levenshtein import NormalizedLevenshtein
from nltk.corpus import brown
from nltk.corpus import stopwords
from question_generation.mcq_gen import Get_Sentences
from question_generation.mcq_gen import Get_Possible_Answers
from question_generation.mcq_gen import Find_Setences_With_Keyword
from question_generation.mcq_gen import Get_Multi_Choice_Questions_Base
from question_generation.mcq_gen import Get_Multi_Choice_Questions_Result
from transformers import T5ForConditionalGeneration, T5Tokenizer
import spacy
import torch
from sense2vec import Sense2Vec
import nltk
from nltk import FreqDist
nltk.download('brown')
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('popular')


class Question_Generator:

    def __init__(self):
        # Initialise the Question_Generator Object

        # Load the T5 tokenizer
        self.tokenizer = T5Tokenizer.from_pretrained("t5-base")

        # pre-trained model by Parth
        t5_result = T5ForConditionalGeneration.from_pretrained(
            "Parth/result")

        # pre-trained model by valhalla
        t5_base_qg = T5ForConditionalGeneration.from_pretrained(
            "valhalla/t5-base-qa-qg-hl")

        # Set the device to use for model inference (GPU if available, otherwise CPU)
        processor = torch.device(
            "cuda" if torch.cuda.is_available() else "cpu")
        t5_result.to(processor)
        t5_base_qg.to(processor)

        # Save the processor and model as instance variables
        self.processor = processor
        self.t5_result = t5_result
        self.t5_base_qg = t5_base_qg

        # Load the spaCy English language model
        self.nlp = spacy.load('en_core_web_sm')

        # Load the Sense2Vec model from disk
        self.s2v = Sense2Vec().from_disk(
            os.path.dirname(os.path.realpath(__file__))+'/s2v_old')

        # Load the Brown corpus and calcualte its frequency distribution
        self.freq_dist = FreqDist(brown.words())

        # Create a NormalizedLevenshtein object for calculating edit distances between strings
        self.normalized_levenshtein = NormalizedLevenshtein()

        # set a seed for repeoducibilty of random operations
        self.select_seed(64)

    def select_seed(self, seed):
        # Set the seed for numpy random number generation
        numpy.random.seed(seed)

        # Set the seed for PyTorch random number generation
        torch.manual_seed(seed)

        # Set the seed for CUDA random number generation, if available
        if torch.cuda.is_available():
            torch.cuda.manual_seed_all(seed)

    def generate_MCQs(self, data, model):
        # Given data containing an input text and an optional maximum number of questions to generate, generate multiple-choice questions related to the input text
        Start_Time = time.time()

        # Extract the input text and maximum number of questions from the payload
        input = {
            "input_text": data.get("input_text"),
            "question_count": data.get("question_count", 8)
        }

        # Tokenize the input text into sentences
        text = input["input_text"]
        sentences = Get_Sentences(text)

        # Join the tokenized sentences into a modified text
        spacer = " "
        text = spacer.join(sentences)

        # Extract Nouns from the modified text using the spaCy English Language model, the Sense2Vec model, and the Brown corpus frequency distribution
        Possible_Answers = Get_Possible_Answers(
            self.nlp, text, input["question_count"], self.s2v, self.freq_dist, self.normalized_levenshtein, len(sentences))
        print(Possible_Answers)
        # Map each noun to a sentence containing that noun
        Possible_Answers_Sentance_Mapping = Find_Setences_With_Keyword(
            Possible_Answers, sentences)
        print(Possible_Answers_Sentance_Mapping)
        # For each keyword, extract a snippet of text from the sentence containing that Noun
        for key in Possible_Answers_Sentance_Mapping.keys():
            snippet = " ".join(Possible_Answers_Sentance_Mapping[key][:3])
            Possible_Answers_Sentance_Mapping[key] = snippet
        print(Possible_Answers_Sentance_Mapping)
        # Init output dictionary
        output = {}

        # If no Nouns were found return empty output dictionary
        if len(Possible_Answers_Sentance_Mapping.keys()) == 0:
            return output
        else:
            # Attempt to generate MCQs from sentence snippets containing keywords
            try:
                print("\n\nmodel:\n" + model)
                if model.lower() == "t5-result":
                    questions = Get_Multi_Choice_Questions_Result(
                        Possible_Answers_Sentance_Mapping, self.processor, self.tokenizer, self.t5_result, self.s2v, self.normalized_levenshtein)
                else:
                    questions = Get_Multi_Choice_Questions_Base(
                        Possible_Answers_Sentance_Mapping, self.processor, self.tokenizer, self.t5_base_qg, self.s2v, self.normalized_levenshtein)
            # If an error occurs during MCQ generation, return empty output dictionary
            except Exception as e:
                print(e)
                exc_type, exc_obj, exc_tb = sys.exc_info()
                fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
                print(exc_type, fname, exc_tb.tb_lineno)
                return output

        # Stop Timer

        End_Time = time.time()

        # Populate final output dictionary with statement, generated questions and time taken to generate questions
        output["statement"] = text
        output["questions"] = questions["questions"]
        output["timetaken"] = End_Time - Start_Time

        # If Pytorch is using CUDA, clear the GPU cahce to free up memory
        if torch.device == "cuda":
            torch.cuda.empty_cache()

        return output
