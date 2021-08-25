FROM klakegg/hugo:edge-alpine

EXPOSE 1313:1313

CMD ["hugo new site"]