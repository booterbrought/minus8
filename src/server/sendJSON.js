function $sendJSON(data) {
  if (this.readyState === this.OPEN)
    this.send(JSON.stringify(data, (key, value) => {
      if (!key.startsWith("$"))
        return value;
    }));
}
module.exports = $sendJSON;
