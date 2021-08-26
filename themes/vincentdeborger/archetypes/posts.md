---
date: '{{ .Date }}'
title: '{{ .File.TranslationBaseName | replaceRE "-" " " | title }}'
draft: true
---