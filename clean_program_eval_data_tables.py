# -*- coding: utf-8 -*-
"""Clean Program Eval Data tables.ipynb

Original file is located at
    https://colab.research.google.com/drive/1HU1NSMCpRpARzBe3BCJbY8U2zVmksALN

"""

#dependencies and setup

import pandas as pd
import os
import numpy as np
import calendar
import json

# Read the CSV file into a DataFrame
csv_path = '2025 Program Evaluation and Presenter Feedback Responses - Program Evaluations.csv'
raw_df = pd.read_csv(csv_path)

# Create clean df with relevant columns and rename them
clean_df = pd.DataFrame().assign(
    program_name=raw_df['Which Cortes Island program did you attend?'],
    intent_check=raw_df['What was your intention for attending this program? Choose up to 3 responses.'],
    align=raw_df['How well did your program experience align with your intention?'],
    purchase_reason=raw_df['What factors influenced your choice to attend this program, specifically? '],
    purchase_other=raw_df['Is there anything else you’d like to share in regards to what influenced your program choice?'],
    impact=raw_df['Which of these statements best summarizes what you are taking away from your  program experience and how you expect to integrate your experience into your daily life and/or within your own community? Choose as many that apply. '],
    impact_comment=raw_df['Was there a particularly impactful or important experience that you would like to share? '],
    rating=raw_df['How would you rate your overall program experience?'])
clean_df['rating'] = clean_df['rating'].astype(int)

# create a list of program names, intentions, purchase reasons, and impacts for use in tallying
program_name_list = clean_df['program_name'].unique().tolist()
intentions_list = ['To deepen my understanding of myself',
                   'To help me navigate a life transition',
                   'To deepen my connection with the natural world',
                   'To explore Cortes Island and be active outdoors.',
                   'To enjoy outdoor adventures',
                   'For professional training or continuing education',
                   'To rest and disconnect',
                   'To develop a new practice or deepen my existing practice.',
                   'To explore my creativity',
                   'To make connections with other like-minded humans',
                   'To spend time with the presenter',
                   'To heal',
                   'Just to be at Hollyhock',
                   'I didn’t have a particular intention']
purchase_reason_list = ['I was interested in the presenter.',
                        'the length of the program',
                        'the timing of the program (month / season)',
                        'the location (Cortes Island / Hollyhock)',
                        'Affordability / price point',
                        'Subject Matter',
                        'Program Description']
impact_list = ['Restoration, peace and deeper presence',
               'Transformational growth, healing, and sense of belonging as one\'s whole self',
               'Greater capacity for inspired and effective leadership (of self and/or others).',
               'Greater awareness of power, justice, and the impacts of colonization',
               'Sense of responsibility to learn/unlearn in order to build more whole relationships',
               'Lasting relationships, deep networks, cross-pollination and collaboration',
               'Deep sense of interconnectedness and responsibility to the natural world']

# Initialize intentions summary
intentions_summary = pd.DataFrame(0, index=program_name_list, columns=intentions_list + ['other_intention'])
intentions_summary.index.name = 'program_name'

#iterate through the rows and tally the intentions by program (including "Other" for custom responses)
#and add all custom responses to a dictionary
intentions_dict = {}
row_count = 0

for index, row in clean_df.iterrows():
    program = row['program_name']
    intentions = [item.strip() for item in row['intent_check'].split(',')]

    if program not in intentions_dict:
        intentions_dict[program] = []

    for intention in intentions:
        if intention in intentions_summary.columns:
            intentions_summary.loc[program, intention] += 1
        else:
            intentions_summary.loc[program, 'other_intention'] += 1
            intentions_dict[program].append(intention)

    row_count += 1

# If there are no custom responses for the program, drop it from the dictionary.
intentions_dict = {program: intentions for program, intentions in intentions_dict.items() if intentions}


# Extract month from prefix and set as value for a new column
intentions_summary['Month'] = intentions_summary.index.str.split(' -> ').str[0].str.split('/').str[0].astype(int).map(lambda x: calendar.month_name[x])

# Clean up the index (program name) by removing date prefix and leading whitespace
intentions_summary.index = intentions_summary.index.str.split(' -> ').str[1].str.strip()

# Reorder columns to place 'Month' at the beginning
cols = intentions_summary.columns.tolist()
cols.insert(0, cols.pop(cols.index('Month')))
intentions_summary = intentions_summary[cols]

# initialize purchase reason summary df
purchase_reason_cols = purchase_reason_list + ['other_reason']
purchase_reason_summary = pd.DataFrame(0, index=clean_df['program_name'].unique(), columns=purchase_reason_cols)
purchase_reason_summary.index.name = 'program_name'

#iterate through the rows and tally by program (including "Other" for custom responses)
#and add all custom responses to a dictionary if not empty
purchase_reason_dict = {}
for index, row in clean_df.iterrows():
    program = row['program_name']
    purchase_reasons = [item.strip() for item in row['purchase_reason'].split(',')]

    if program not in purchase_reason_dict:
        purchase_reason_dict[program] = []

    for reason in purchase_reasons:
        if reason in purchase_reason_summary.columns:
            purchase_reason_summary.loc[program, reason] += 1
        else:
            purchase_reason_summary.loc[program, 'other_reason'] += 1
            if reason: # Only append non-empty strings
                purchase_reason_dict[program].append(reason)

# If there are no custom responses for the program, drop it from the dictionary.
# add month and tidy up the index
purchase_reason_dict = {program: reasons for program, reasons in purchase_reason_dict.items() if reasons}

purchase_reason_summary['Month'] = purchase_reason_summary.index.str.split(' -> ').str[0].str.split('/').str[0].astype(int).map(lambda x: calendar.month_name[x])

purchase_reason_summary.index = purchase_reason_summary.index.str.split(' -> ').str[1].str.strip()

cols = purchase_reason_summary.columns.tolist()
cols.insert(0, cols.pop(cols.index('Month')))
purchase_reason_summary = purchase_reason_summary[cols]

# Initialize impact summary df
impact_summary = pd.DataFrame(0, index=program_name_list, columns=impact_list + ['other_impact'])
impact_summary.index.name = 'program_name'

# Iterate through the rows and tally the impacts by program (including "Other" for custom responses)
# and add all custom responses to a dictionary
impact_dict = {}
for index, row in clean_df.iterrows():
    program = row['program_name']
    impacts_text = row['impact']

    if program not in impact_dict:
        impact_dict[program] = []

    for impact in impact_list:
        if impact in impacts_text:
            impact_summary.loc[program, impact] += 1

    # Identify and collect other impacts
    other_impacts = []
    remaining_text = impacts_text
    for impact in impact_list:
        remaining_text = remaining_text.replace(impact, '').strip(', ')

    # Split the remaining text by comma and add to other_impacts if not empty
    if remaining_text:
        other_impacts.extend([item.strip() for item in remaining_text.split(',') if item.strip()])

    if other_impacts:
        impact_summary.loc[program, 'other_impact'] += len(other_impacts)
        impact_dict[program].extend(other_impacts)

# If there are no custom responses for the program, drop it from the dictionary.
impact_dict = {program: impacts for program, impacts in impact_dict.items() if impacts}

# Extract month from prefix and set as value for a new column
impact_summary['Month'] = impact_summary.index.str.split(' -> ').str[0].str.split('/').str[0].astype(int).map(lambda x: calendar.month_name[x])

# Clean up the index (program name) by removing date prefix and leading whitespace
impact_summary.index = impact_summary.index.str.split(' -> ').str[1].str.strip()

# Reorder columns to place 'Month' at the beginning
cols = impact_summary.columns.tolist()
cols.insert(0, cols.pop(cols.index('Month')))
impact_summary = impact_summary[cols]

# generate ratign statistics from clean_df
total_count=clean_df['rating'].count()
min_rating=clean_df['rating'].min()
max_rating=clean_df['rating'].max()
mean_rating=clean_df['rating'].mean()

#intentions_summary.to_csv('intentions_summary.csv')
#purchase_reason_summary.to_csv('purchase_reason_summary.csv')
#impact_summary.to_csv('impact_summary.csv')