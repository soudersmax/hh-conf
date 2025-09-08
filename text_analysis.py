import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from wordcloud import WordCloud
import matplotlib.pyplot as plt
import os
import json

with open('intentions_dict.json', 'r') as f:
    intentions_dict = json.load(f)

# If not already downloaded:
nltk.download('popular')
nltk.download('punkt_tab')
nltk.download('stopwords')

# Flatten all custom intentions into a single list
all_intentions = [item for sublist in intentions_dict.values() for item in sublist]

# Tokenize and clean
tokens = [word.lower() for item in all_intentions for word in word_tokenize(item, language='english')]
stop_words = set(stopwords.words('english'))
custom_exclude = {'hollyhock', 'spend', 'program', 'week', 'mom', 'teenage', 'cosmo', 'part'}
filtered_tokens = [w for w in tokens if w.isalpha() and w not in stop_words and w not in custom_exclude]

# Frequency distribution
fdist = nltk.FreqDist(filtered_tokens)
print('Most common words:', fdist.most_common(10))

# Word cloud
text = ' '.join(filtered_tokens)
wordcloud = WordCloud(width=800, height=400, background_color='white').generate(text)
plt.figure(figsize=(10,5))
plt.imshow(wordcloud, interpolation='bilinear')
plt.axis('off')
plt.title('Custom Intentions Word Cloud')
plt.show()
output_path = 'intentions_wordcloud.png'
wordcloud.to_file(output_path)
print(f'Word cloud saved to {output_path}')