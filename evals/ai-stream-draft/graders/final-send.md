---
type: regex
pattern: '(final|persist|complete|finish|disappear|ephemeral|temporary|30.second|финал|исчез|30 секунд|временн)[\s\S]{0,300}(sendMessage\b|send_message\(|\.answer\()|(sendMessage\b|send_message\(|\.answer\()[\s\S]{0,200}(persist|final|disappear|temporary|финал|исчез)'
flags: i
weight: 2
---
