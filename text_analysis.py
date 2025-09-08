import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from wordcloud import WordCloud
import matplotlib.pyplot as plt
import os
import json

# Load all dicts from correct file paths
with open('/workspaces/hh-conf/Data/intentions_dict.json', 'r') as f:
    intentions_dict = json.load(f)
with open('/workspaces/hh-conf/Data/impact_dict.json', 'r') as f:
    impact_dict = json.load(f)

# If not already downloaded:
nltk.download('punkt')
nltk.download('stopwords')

custom_exclude = {
    'hollyhock', 'spend', 'program', 'week', 'mom', 'teenage', 'cosmo', 'part',
    'drinking', 'within', 'tourists', 'deck', 'happened', 'gained', 'fascism', 'children',
    'flora', 'merlin', 'alcohol', 'atum', 'bullet', 'dogs', 'babatunde', 'seems', 'carried',
    'programs', 'coming', 'medium', 'specifically', 'olatunji', 'barking', 'dig', 'campus',
    'last', 'big'
}
stop_words = set(stopwords.words('english'))

def analyze_and_wordcloud(data_dict, output_filename):
    all_text = [item for sublist in data_dict.values() for item in sublist]
    tokens = [word.lower() for item in all_text for word in word_tokenize(item, language='english')]
    filtered_tokens = [w for w in tokens if w.isalpha() and w not in stop_words and w not in custom_exclude]
    fdist = nltk.FreqDist(filtered_tokens)
    print(f'Most common words in {output_filename}:', fdist.most_common(10))
    text = ' '.join(filtered_tokens)
    wordcloud = WordCloud(width=350, height=700, background_color='white').generate(text)
    plt.figure(figsize=(5,10))
    plt.imshow(wordcloud, interpolation='bilinear')
    plt.axis('off')
    plt.title(f'Word Cloud: {output_filename}')
    plt.show()
    wordcloud.to_file(output_filename)
    print(f'Word cloud saved to {output_filename}')

# Run analysis for each dict
analyze_and_wordcloud(intentions_dict, 'intentions_wordcloud.png')
analyze_and_wordcloud(impact_dict, 'impact_wordcloud.png')