FQDN ?= 127.0.0.1
OUTDIR ?= tls
# may be /etc/pki/tls in some machines.
# use `openssl version -a | grep OPENSSLDIR` to find out.
OPENSSLDIR ?= /etc/ssl

.PHONY: generate
generate: 
	$(MAKE) prepare 
	$(MAKE) redis.crt 
	$(MAKE) clean

.PHONY: prepare
prepare:
	mkdir ${OUTDIR}

.PHONY: clean
clean:
	rm -f ${OUTDIR}/openssl.cnf

openssl.cnf:
	cat ${OPENSSLDIR}/openssl.cnf > ${OUTDIR}/openssl.cnf
	echo "" >> ${OUTDIR}/openssl.cnf
	echo "[ san_env ]" >> ${OUTDIR}/openssl.cnf
	echo "subjectAltName = IP:${FQDN}" >> ${OUTDIR}/openssl.cnf

ca.key:
	openssl genrsa 4096 > ${OUTDIR}/ca.key

ca.crt: 
	$(MAKE) ca.key 
	sudo openssl req \
		-new \
		-x509 \
		-nodes \
		-sha256 \
		-key ${OUTDIR}/ca.key \
		-days 3650 \
		-subj "/C=AU/CN=example" \
		-out ${OUTDIR}/ca.crt

redis.csr: 
	$(MAKE) openssl.cnf
	SAN=IP:$(FQDN) openssl req \
		-reqexts san_env \
    -extensions san_env \
    -config ${OUTDIR}/openssl.cnf \
    -newkey rsa:4096 \
    -nodes -sha256 \
    -keyout ${OUTDIR}/redis.key \
    -subj "/C=AU/CN=$(FQDN)" \
    -out ${OUTDIR}/redis.csr

redis.crt:
	$(MAKE) ca.crt 
	$(MAKE) redis.csr 
	SAN=IP:$(FQDN) openssl x509 \
		-req -sha256 \
    -extfile ${OUTDIR}/openssl.cnf \
    -extensions san_env \
    -days 3650 \
    -in ${OUTDIR}/redis.csr \
    -CA ${OUTDIR}/ca.crt \
    -CAkey ${OUTDIR}/ca.key \
    -CAcreateserial \
		-out ${OUTDIR}/redis.crt