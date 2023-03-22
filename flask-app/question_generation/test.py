import string
from collections import OrderedDict
from nltk.tokenize import sent_tokenize
from nltk.corpus import stopwords
from flashtext import KeywordProcessor
import pke
import torch
import os
import sys
import time
import numpy
from strsimpy.normalized_levenshtein import NormalizedLevenshtein
from nltk.corpus import brown
from nltk.corpus import stopwords
from transformers import T5ForConditionalGeneration, T5Tokenizer
import spacy
import torch
from sense2vec import Sense2Vec
import nltk
from nltk import FreqDist


tokenizer = T5Tokenizer.from_pretrained("t5-base")
model = T5ForConditionalGeneration.from_pretrained("valhalla/t5-base-qa-qg-hl")
processor = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(processor)
nlp = spacy.load('en_core_web_sm')


answer = 'immigrant parents'
text = 'Rami Said Malek was born in Torrance, California, on May 12, 1981, the son of Egyptian immigrant parents Nelly Abdel-Malek and Said Malek (d. 2006). He has said he is also "an eighth Greek".'
text = text.replace(answer, f"<hl> {answer} <\hl>")

print("\n\nSentence_Filtered_Keywords Text:\n" +
      text+"\n\n\n")

# Generate Questions using T5 model
input_text = f"generate question: {text}"
input_ids = tokenizer.encode(
    input_text, return_tensors="pt").to(processor)

print("\n\n input ids: \n" + str(input_ids))

outputs = model.generate(
    input_ids=input_ids, max_length=128, do_sample=True, num_return_sequences=1)

question_text = tokenizer.decode(
    outputs[0], skip_special_tokens=True).strip()

print("Queston: " + question_text)
# Populate individual question object
