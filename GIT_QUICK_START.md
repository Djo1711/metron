# ⚡ Git Setup - Version EXPRESS (2 minutes)

## 🎯 OPTION A : Script Automatique (RECOMMANDÉ)

### Mac/Linux :
```bash
cd metron
chmod +x git-setup.sh
./git-setup.sh https://github.com/TON-USERNAME/metron.git
```

### Windows :
```bash
cd metron
git-setup.bat https://github.com/TON-USERNAME/metron.git
```

**C'EST TOUT ! Le script fait tout automatiquement.** ✅

---

## 🎯 OPTION B : Manuel (si le script ne marche pas)

### Étape 1 : Entre dans le dossier
```bash
cd metron
```

### Étape 2 : Init + Remote
```bash
git init
git remote add origin https://github.com/TON-USERNAME/metron.git
```

### Étape 3 : Commit
```bash
git add .
git commit -m "feat: initial setup"
```

### Étape 4 : Push
```bash
git branch -M main
git push -u origin main
```

### Étape 5 : Branche develop
```bash
git checkout -b develop
git push -u origin develop
git checkout main
```

**TERMINÉ !** ✅

---

## ✅ Vérification Rapide

Va sur GitHub/GitLab → Refresh → Tu dois voir :
- ✅ Tous les fichiers
- ✅ 2 branches (main + develop)
- ✅ 1 commit

---

## 🆘 Problème ?

### "Permission denied"
→ Utilise HTTPS au lieu de SSH :
```bash
git remote set-url origin https://github.com/username/metron.git
```

### "Repository not empty"
→ Force push (attention ⚠️) :
```bash
git push -u origin main --force
```

### Autre chose
→ Lis le guide détaillé : `TRANSFER_TO_GIT.md`

---

## 🎯 Prochaine Étape

Une fois que le code est sur Git :
→ Lis `docs/SUPABASE_SETUP.md` pour setup la base de données

**C'est parti ! 🚀**
