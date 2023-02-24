from pprint import pprint
import main

payload = {
    "input_text": "The Roman conquest, beginning in 43 AD, and the 400-year rule of southern Britain, was followed by an invasion by Germanic Anglo-Saxon settlers, reducing the Brittonic area mainly to what was to become Wales, Cornwall and, until the latter stages of the Anglo-Saxon settlement, the Hen Ogledd (northern England and parts of southern Scotland). Most of the region settled by the Anglo-Saxons became unified as the Kingdom of England in the 10th century. Meanwhile, Gaelic-speakers in north-west Britain (with connections to the north-east of Ireland and traditionally supposed to have migrated from there in the 5th century) united with the Picts to create the Kingdom of Scotland in the 9th century."
}

mcq_gen = main.Question_Generator()

output = mcq_gen.generate_MCQs(payload)

pprint(output)
