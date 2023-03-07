from sense2vec import Sense2Vec
import string
from collections import OrderedDict
from nltk.tokenize import sent_tokenize
from nltk.corpus import stopwords
from flashtext import KeywordProcessor
import pke
import torch

# Check if there are any multiple choice questions available for a specific word using sense2vec


def check_MCQs_Available(word, s2v):
    word = word.replace(" ", "_")  # Replace all spaces with underscores
    sense = s2v.get_best_sense(word)
    if sense is None:
        return False
    else:
        return True

# Return all that are a one character variation from inputted word


def Character_Variation(word):
    letters = string.ascii_lowercase + string.punctuation
    split_words = [(word[:i], word[i:]) for i in range(len(word)+1)]

    delete_chars = [Left_Word + Right_Word[1:]
                    for Left_Word, Right_Word in split_words if Right_Word]

    move_chars = [Left_Word + Right_Word[1] + Right_Word[0] + Right_Word[2:]
                  for Left_Word, Right_Word in split_words if len(Right_Word) > 1]

    replace_chars = [Left_Word + char + Right_Word[1:] for Left_Word,
                     Right_Word in split_words if Right_Word for char in letters]

    insert_chars = [Left_Word + char + Right_Word for Left_Word,
                    Right_Word in split_words for char in letters]

    return set(delete_chars + move_chars + replace_chars + insert_chars)


# Using Sense2Vec find similar words


def Find_Similar_Words(word, s2v):
    # Process word to match Sense2Vec format

    Processed_Word = word.translate(
        word.maketrans("", "", string.punctuation)).lower()  # Remove all punctuation and make lowercase

    # Get all one character variations of word
    Variant_Words = Character_Variation(Processed_Word)

    word = word.replace(" ", "_")  # Swap all spaces with underscores

    sense = s2v.get_best_sense(word)  # Get context of word in s2v model
    # Returns 15 words that are most similar to the sense
    Similar_Words = s2v.most_similar(sense, n=15)

    output = []

    comparison_list = [Processed_Word]
    for Similar_Word in Similar_Words:

        # Extract word without the sense, replacing underscores with spaces, stripping of any leading/trailing white spaces, convert to lowercase and remove any punctuation
        Similar_Word = Similar_Word[0].split(
            "|")[0].replace("_", " ").strip()

        Raw_Word = Similar_Word

        Similar_Word = Similar_Word.lower()

        Similar_Word = Similar_Word.translate(
            Similar_Word.maketrans("", "", string.punctuation))

        # Check if Similar_Word has not been encounted before, the input word is not the same as Similar_Word and Similar_Word is not present in Variant_Wods
        if Similar_Word not in comparison_list and Processed_Word not in Similar_Word and Similar_Word not in Variant_Words:
            output.append(Raw_Word.title())
            # Add word to comparison list to advoid duplicates
            comparison_list.append(Similar_Word)

    out = list(OrderedDict.fromkeys(output))

    return out


# Generate incorrect answers for MCQ
def Get_Incorrect_Answers(answer, s2v):
    Incorrect_Answers = []  # Init empty list to store incorrect answers

    try:
        # Get incorrect answers using sense2vec
        Incorrect_Answers = Find_Similar_Words(answer, s2v)
        # If incorrect answers are successfully retrieved, return them and the method used to get them
        if len(Incorrect_Answers) > 0:
            return Incorrect_Answers, "sense2vec"
    except Exception as e:
        print("Generation of Incorrect Answers failed for ", answer)
        print(e)

    # If no incorrect answers are found return empty list and "None"
    return Incorrect_Answers, "None"


# Split text input into sentences
def Get_Sentences(text):
    # Use the sentance tokenizer to split the text into a list of sentences
    sentences = [sent_tokenize(text)]
    # Flatten the list of lists to get a single list of sentences
    sentences = [y for x in sentences for y in x]
    # Remove any sentence that has a length of less than 20
    sentences = [sentence.strip()
                 for sentence in sentences if len(sentence) > 10]

    return sentences

# Get sentences that contain the keywords


def Find_Setences_With_Keyword(keywords, sentences):
    # Init Keyword Processor Object
    keyword_processor = KeywordProcessor()
    # Init empty dictionary to store sentences containing keywords
    Matching_Sentences = {}
    # Loop through each keyword and add it to the keyword processor object
    for word in keywords:
        word = word.strip()  # Remove any leading/trailing whitespaces
        # Add new list into dictionary with the keyword being the key
        Matching_Sentences[word] = []
        # Add keyword to the keyword processor
        keyword_processor.add_keyword(word)

    # Loop though each sentence in the input list of sentences
    for sentence in sentences:
        # Extract any keywords found in the sentence using the keyword processor
        Matching_Keywords = keyword_processor.extract_keywords(sentence)
        # Loop through each matching keyword in the sentence and add the sentence to the corresponding list in the dict
        for Keyword in Matching_Keywords:
            Matching_Sentences[Keyword].append(sentence)

    # Sort the sentences contain each keyword by length in desc order
    for Keyword in Matching_Sentences.keys():
        values = Matching_Sentences[Keyword]
        values = sorted(values, key=len, reverse=True)
        Matching_Sentences[Keyword] = values

    # Remove any empty lists from dict
    delete_keys = []
    for i in Matching_Sentences.keys():
        if len(Matching_Sentences[i]) == 0:
            delete_keys.append(i)
    for key in delete_keys:
        del Matching_Sentences[key]

    # Return the dict of sentences containing each keyword
    return Matching_Sentences


def Words_Far_Apart(words, currWord, threshold, normalized_levenshtein):
    scores = []

    # For each word in the list of words, calculate the nioramlized Levenshtein distance between the word and the current word
    for word in words:
        scores.append(normalized_levenshtein.distance(
            word.lower(), currWord.lower()))
    # If the minimum distance between the two words is greater than or equal to the threshold, return true (i.e. the words are far apart)
    if threshold <= min(scores):
        return True
    # Otherwise, return False (i.e. the words are close together)
    else:
        return False

# Filter List of phrases based on their similarity with each other


def filter_phrases(phrases, max, normalized_levenshtein):
    # Init empty list to hold the filtered phrases
    Filtered = []
    # If the input list is not empty, add the first key to the filtered list
    if len(phrases) > 0:
        Filtered.append(phrases[0])
        # Iterate through the remaining phrase keys in the input list
        for phrase in phrases[1:]:
            # Check if the distance is greater than the threshold if so add the current phrase to the filtered phrases list
            if Words_Far_Apart(Filtered, phrase, 0.7, normalized_levenshtein):
                Filtered.append(phrase)
            # if the number of filtered phrases has reached the maximum, break out of the loop
            if len(Filtered) >= max:
                break

    return Filtered

# Get a list of important nouns and proper nouns in the text


def Get_POS(text):
    POS = []

    # Initialize the MultipartiteRank extractor
    extractor = pke.unsupervised.MultipartiteRank()

    # Load the document and set the language to English
    extractor.load_document(input=text, language="en")

    # Set the part-of-speech tags to extract candidates from
    pos = {"PROPN", "NOUN_PROP", "ADJ", "ADV", "VERB", "NUM"}

    # Define a list, which contains punctuation and English stopwords
    stoplist = list(string.punctuation) + stopwords.words("english")

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

# Get a list of the top 50 longest phrases that occur more than once in the text


def Get_Common_Phrases(document):
    # Init an empty dict to store the phrases and their frequency
    phrases = {}

    # Iterate over each noun phrase in the document
    for Noun_Phrase in document.noun_chunks:
        # Extract text from Noun Phrase
        phrase = Noun_Phrase.text
        # Count the number of words in the noun phrase
        count = len(phrase.split())

        # If the noun has more than one word
        if count > 1:
            # If the noun phrase is not already exist in the phrases dict
            if phrase not in phrases:
                # Create phrase in dict
                phrases[phrase] = 1
            # If the nound does exist in the phrases dict
            else:
                # Increment frequency by 1
                phrases[phrase] = + 1

    # Get a List of all phrases in dictionary
    Dict_Phrases = list(phrases.keys())

    # Sort the list of phrases by length in desc order
    Dict_Phrases = sorted(Dict_Phrases, key=lambda x: len(x), reverse=True)

    # Keep only the top 50 longest phrases
    Dict_Phrases = Dict_Phrases[:50]

    return Dict_Phrases

# Return list of top keywords that could be used as answers for MCQs


def Get_Possible_Answers(nlp, text, keywords_limit, s2v, freq_dist, normalized_levenshtein, sentence_count):

    # Create a spaCy document from input text
    document = nlp(text)

    # Ensure that keywords_limit is a integer
    keywords_limit = int(keywords_limit)

    # Get key Nouns using MultipartiteRank algorithm and sort them by their frequency
    Nouns = Get_POS(text)
    Nouns = sorted(Nouns, key=lambda x: freq_dist[x])

    # Filter out phrases that are too similar and keep only the top max_keywords
    Nouns = filter_phrases(Nouns, keywords_limit, normalized_levenshtein)

    # Get phrases from the input text and sort them by their length
    phrase_keys = Get_Common_Phrases(document)

    # Filter out phrases that are too similar and keep only the top keywords
    filtered_phrases = filter_phrases(
        phrase_keys, keywords_limit, normalized_levenshtein)

    # Combine the top Nouns and phrases
    phrases = Nouns + filtered_phrases

    # Filter out thise that are too similar
    phrases = filter_phrases(phrases, min(
        keywords_limit, 2*sentence_count), normalized_levenshtein)

    # Check if each phrase can be used as a valid answer option for a multiple-choice question and only keep the top keywords_limit
    Possible_Answers = []

    for possible_answer in phrases:
        if possible_answer not in Possible_Answers and check_MCQs_Available(possible_answer, s2v):
            Possible_Answers.append(possible_answer)

    Possible_Answers = Possible_Answers[:keywords_limit]
    return Possible_Answers

# Generate multiple choice questions based on the input text


def Get_Multi_Choice_Questions(sentence_Filtered_Keyword, processor, tokenizer, model, sense2vec, normalized_levenshtein):
    # Create batch text with context and answer

    batch_text = []
    answers = sentence_Filtered_Keyword.keys()

    for answer in answers:
        text = sentence_Filtered_Keyword[answer]
        text = "context: " + text + " answer: " + answer
        batch_text.append(text)

    # Encode the batch text
    encode = tokenizer.batch_encode_plus(
        batch_text, pad_to_max_length=True, return_tensors="pt")

    # Run model for generation
    input_ids, attention_masks = encode["input_ids"].to(
        processor), encode["attention_mask"].to(processor)

    with torch.no_grad():
        outputs = model.generate(
            input_ids=input_ids, attention_mask=attention_masks, max_length=150)

    # Init output array
    output_dict = {}
    output_dict["questions"] = []
    for i, answer in enumerate(answers):
        # Create individual question objects
        question = {}

        output = outputs[i, :]
        decode = tokenizer.decode(
            output, skip_special_tokens=True, clean_up_tokenization_spaces=True)

        # Extract generated question from the model's output
        Question = decode.replace("question:", "")
        Question = Question.strip()

        # Populate individual question object
        question["question_statement"] = Question
        question["question_type"] = "MCQ"
        question["answer"] = answer.title()
        question["id"] = i + 1

        # Get incorrect answers for the Question
        question["options"], question["options_algorithm"] = Get_Incorrect_Answers(
            answer, sense2vec)

        # Filter and limit incorrect answers to 3
        question["options"] = filter_phrases(
            question["options"], 10, normalized_levenshtein)
        i = 3
        question["extra_options"] = question["options"][i:]
        question["options"] = question["options"][:i]
        question["context"] = sentence_Filtered_Keyword[answer]

        if len(question["options"]) > 0:
            # Append the generated question to output
            output_dict["questions"].append(question)

    return output_dict
