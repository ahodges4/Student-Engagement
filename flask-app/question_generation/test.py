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


def extract_numbers(text):
    tokens = nltk.word_tokenize(text)
    tagged_tokens = nltk.pos_tag(tokens)

    numbers = []
    for token, tag in tagged_tokens:
        if tag == 'CD':
            numbers.append(token)

    return numbers


def Get_POS(text):
    POS = []
    numbers = extract_numbers(text)
    for n in numbers:
        POS.append(n)
    # Initialize the MultipartiteRank extractor
    extractor = pke.unsupervised.MultipartiteRank()

    # Load the document and set the language to English
    extractor.load_document(input=text, language="en")

    # Set the part-of-speech tags to extract candidates from
    # pos = {"PROPN", "NOUN_PROP", "ADJ", "ADV", "VERB", "NUM"}
    pos = {"PROPN", "NOUN", "ADJ"}

    # Select the candidate keyphrases using the specified parts of speech and stoplist
    extractor.candidate_selection(pos=pos)

    # Weight the candidate keyphrases using MultipartiteRank with specified alpha and threshold parameters
    try:
        extractor.candidate_weighting(
            alpha=1.2, threshold=0.75, method="average")
    except:
        return POS

    # Get the n best candidate keyphrases
    keyphrases = extractor.get_n_best(n=10)

    # Extract the keyphrases from the returned tuple and append them to the output
    for k in keyphrases:
        POS.append(k[0])

    return POS


print(Get_POS("""'Rami Said Malek was born in Torrance, California, on May 12, 1981, the son of Egyptian immigrant parents Nelly Abdel-Malek and Said Malek (d. 2006).He has said he is also "an eighth Greek". His parents and older sister left Cairo in 1978 after his father, a travel agent and tour guide, became intrigued with Western visitors. They settled in Sherman Oaks, mostly staying in the San Fernando Valley. As a child, Malek rarely ventured into Hollywood, "I grew up in the San Fernando Valley in LA, but somehow, I had no idea that I lived right next to Hollywood... I truly thought that that was a million miles away, and it's just a 10-minute drive". His father sold insurance and was a travel agent, while his mother worked as an accountant. Malek was raised in his family's Coptic Orthodox Christian faith, and spoke Egyptian Arabic at home until the age of four. He has an identical twin brother named Sami, who is younger by four minutes and later became an ESL and English teacher. His older sister, Yasmine, is an ER doctor. His parents emphasized to their children the importance of preserving their Egyptian roots, and his father would wake him up in the middle of the night to talk on the phone to his Arabic-speaking extended family in Samalut. As a first-generation American, Malek found it difficult to assimilate during his childhood because of cultural differences, even spending most of his childhood having his name mispronounced: "It only took me 'til high school where I found the confidence to tell everybody, \'No, my name is Rami.\' It\'s a very upsetting thing to think about, that I didn\'t have the confidence to correct anyone at that point." As a result, he said it was difficult to form a self-identity as a child and gravitated towards "creating characters and doing voices" as he searched for an outlet for his energy. Malek attended Notre Dame High School, where he was in the same class as actress Rachel Bilson. He is a year older than actress Kirsten Dunst, who also attended the school and shared a musical theater class with him. His parents harbored dreams of him becoming a lawyer, so he joined the debate team in his freshman year. Though he struggled to form arguments, his debate teacher noted his talent in dramatic interpretation and encouraged him instead to perform the one-man play Zooman and The Sign at a competition. Reflecting on the moment, he said, "On stage I\'m having this moment with my dad with a bunch of other people , but then I thought, 'Wow, something really special is happening here.'" It was the first time he saw his father become emotional, and his parents' positive reaction to his performance left him feeling free to pursue an acting career. He and his brother were both involved in the school's drama department. After graduating in 1999, Malek went on to study theater at the University of Evansville in Evansville, Indiana. He also spent a semester abroad in England, where he studied at Harlaxton College in Harlaxton, Lincolnshire. During the summer before his senior year, he interned at the Eugene O'Neill Theater Center in Waterford, Connecticut, where he became an acquaintance of playwright August Wilson. Of his decision to attend the University of Evansville theater program, he said, "The level of talent at the University of Evansville was formidable from faculty to fellow actors. There's a commitment and dedication that the theater program required that unearthed a work ethic I didn\'t know I had." He completed his BFA in 2003. The college later honored him with a 2017 Young Alumnus Award, given to those who have "achieved personal success and contribute services to their community and to UE"."""))


# tokenizer = T5Tokenizer.from_pretrained("t5-base")
# model = T5ForConditionalGeneration.from_pretrained("valhalla/t5-base-qa-qg-hl")
# processor = torch.device("cuda" if torch.cuda.is_available() else "cpu")
# model.to(processor)
# nlp = spacy.load('en_core_web_sm')

# text = "42 is that answer to life, the universe and everyhting"
# answer = Get_POS(text)[0]

# text = text.replace(answer, f"<hl> {answer} <hl>")

# print("\n\nSentence_Filtered_Keywords Text:\n" +
#       text+"\n\n\n")

# # Generate Questions using T5 model
# input_text = f"generate question: {text} </s>"
# input_ids = tokenizer.encode(
#     input_text, return_tensors="pt").to(processor)

# print("\n\n input ids: \n" + str(input_ids))

# outputs = model.generate(
#     input_ids=input_ids, max_length=128, do_sample=True, num_return_sequences=1)

# question_text = tokenizer.decode(
#     outputs[0], skip_special_tokens=True).strip()

# print("Queston: " + question_text)
# # Populate individual question object
