FROM klakegg/hugo:edge-alpine
COPY site /src

CMD ['server']
EXPOSE 1313:1313