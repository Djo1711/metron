"""
Username validation and profanity filter
"""

# Liste de mots interdits
BLOCKED_WORDS = [
    # Insultes générales
    "fuck", "shit", "bitch", "ass", "dick", "cunt", "puta", "merde", "connard", "salope",
    "putain", "enculé", "fdp", "ntm", "pute", "con", "bite", "chatte", "couille",
    
    # Termes offensants/racistes
    "nigger", "nigga", "negro", "retard", "retarded", "faggot", "fag", "tranny",
    "kike", "chink", "gook", "spic", "wetback", "nazi", "hitler", "holocaust",
    
    # Termes haineux
    "rape", "rapist", "kill", "murder", "terrorist", "suicide", "bomb",
    
    # Variantes avec chiffres/caractères spéciaux
    "f4g", "n1gger", "h1tler", "fvck", "sh1t", "b1tch", "a$$", "d1ck",
    
    # Termes sexuels explicites
    "porn", "sex", "anal", "cum", "cock", "pussy", "boobs", "tits", "penis", "vagina",
    "nude", "nudes", "xxx", "milf", "dildo", "vibrator",
    
    # Arnaques/spam
    "admin", "moderator", "support", "official", "verified", "staff", "metron",
    "bot", "system", "root", "god", "jesus", "allah", "muhammad",
    
    # Autres
    "666", "1488", "88", "14"
]

# Patterns suspects
SUSPICIOUS_PATTERNS = [
    "admin", "mod", "owner", "staff", "support", "official", "verify",
    "metron", "ceo", "president", "director"
]


def normalize_text(text: str) -> str:
    """Normalise le texte pour détecter les contournements"""
    text = text.lower()
    replacements = {
        '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's',
        '7': 't', '8': 'b', '@': 'a', '$': 's', '!': 'i'
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    return text


def contains_blocked_word(username: str) -> tuple:
    """Vérifie si le username contient un mot bloqué"""
    username_lower = username.lower()
    username_normalized = normalize_text(username)
    
    for word in BLOCKED_WORDS:
        if word in username_lower or word in username_normalized:
            return True, "Le pseudo contient un terme interdit"
    
    for pattern in SUSPICIOUS_PATTERNS:
        if pattern in username_lower:
            return True, f"Le pseudo ne peut pas contenir '{pattern}'"
    
    if username.isdigit():
        return True, "Le pseudo ne peut pas être composé uniquement de chiffres"
    
    if len(username) < 3:
        return True, "Le pseudo doit contenir au moins 3 caractères"
    
    if len(username) > 20:
        return True, "Le pseudo ne peut pas dépasser 20 caractères"
    
    return False, ""


def validate_username(username: str) -> tuple:
    """Valide un username complet"""
    username = username.strip()
    
    allowed_chars = set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_- ")
    if not all(c in allowed_chars for c in username):
        return False, "Le pseudo ne peut contenir que des lettres, chiffres, espaces, _ et -"
    
    is_blocked, reason = contains_blocked_word(username)
    if is_blocked:
        return False, reason
    
    return True, ""
