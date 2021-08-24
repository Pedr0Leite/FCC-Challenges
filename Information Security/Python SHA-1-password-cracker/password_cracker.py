import hashlib

def crack_sha1_hash(hash):
    with open("top-10000-passwords.txt", 'rb') as f:
        passwords = f.readlines()

    for word in passwords:
        hashed_word = hashlib.sha1(word.strip()).hexdigest()
        if hashed_word == hash:
            return word.strip().decode('utf-8')
    return "PASSWORD NOT IN DATABASE"