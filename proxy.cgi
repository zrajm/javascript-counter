#!/bin/zsh
cat <<-EOF;
	Content-Type: text/html; charset=iso-8859-1
	Cache-control: no-cache
	Pragma: no-cache
	Expires: 0

	`wget -O- --no-check-certificate $QUERY_STRING 2>/dev/null`
EOF
