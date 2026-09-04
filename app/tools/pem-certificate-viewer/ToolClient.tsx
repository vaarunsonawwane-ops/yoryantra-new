"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type Asn1Node = {
  tagClass: number;
  constructed: boolean;
  tag: number;
  start: number;
  contentStart: number;
  end: number;
  children: Asn1Node[];
};

type X509Summary = {
  version: string;
  serialNumber: string;
  issuer: string;
  subject: string;
  notBefore: string;
  notAfter: string;
  validityState: string;
  signatureAlgorithm: string;
  publicKeyAlgorithm: string;
  subjectAlternativeNames: string[];
  basicConstraints: string;
};

type PemBlock = {
  type: string;
  byteLength: number;
  base64Length: number;
  fingerprint: string;
  readablePreview: string;
  x509: X509Summary | null;
  warnings: string[];
};

type PemReport = {
  blocks: PemBlock[];
  warnings: string[];
  privateKeyBlocks: number;
  certificateBlocks: number;
};

const SAMPLE_PEM = `-----BEGIN CERTIFICATE-----
MIIDdzCCAl+gAwIBAgIUEWJo+4I40rD6MijWN5/vN4um3JkwDQYJKoZIhvcNAQEL
BQAwSzEgMB4GA1UEAwwXZXhhbXBsZS55b3J5YW50cmEubG9jYWwxGjAYBgNVBAoM
EVlvcnlhbnRyYSBFeGFtcGxlMQswCQYDVQQGEwJJTjAeFw0yNjA3MDIyMDMzNTZa
Fw0zNjA2MjkyMDMzNTZaMEsxIDAeBgNVBAMMF2V4YW1wbGUueW9yeWFudHJhLmxv
Y2FsMRowGAYDVQQKDBFZb3J5YW50cmEgRXhhbXBsZTELMAkGA1UEBhMCSU4wggEi
MA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDXBPmJlcJ99acPgtpgFSWSGiBU
qW41piAf2hFgj2D4CfsHNHP7xrkClKTCHe7VKW+Bm5J33gIGw2UXZjCfjEzCnF7F
ajEeqtCRy9apmKJajihrhOeniIrW44F0XnRILizDQUPpLw8YTHKMdICPHApF/uxZ
ArRA+ImWuqkkZqEitEVM14FbtDbuuEqZOF9DuhnafD6SKRF/4NBZwATx6NhY3pYW
Z1eeTJitnrH6YZb/9aSleYalHWVpoLW+GWnzR4QJmLKLLmWWCqNdjhVdF8DJcQ1K
jzfrDurUlbRnSR8s25l3dTb/Di+dJ+JKw6Jv3nkxIDSCmZ+LYZv8YVd2vS+/AgMB
AAGjUzBRMB0GA1UdDgQWBBQol4hxmGMZjhRIoqRh2IvowsrwszAfBgNVHSMEGDAW
gBQol4hxmGMZjhRIoqRh2IvowsrwszAPBgNVHRMBAf8EBTADAQH/MA0GCSqGSIb3
DQEBCwUAA4IBAQChXspLybcoenxVRqgZBki8bvjlOxfzgRjBNNvcfOPXNSdkR62N
SxnoZCfn8w3bgpbgOkfX+gxY7760p4gcL/VmK4LF8TX49oF7jQCmlLSoZoM6rEdQ
d94eRqyWszzY3Fx9CN+1U4RNwMi+p0gc85QNfjWBcMLhxzAvQ5AyjMMQCJeQ7sjX
IQipn8aS8K8XRvO/zwuVh8v+66weuRStqrwwfuOyQ4g7DeAxDOeSX9B8blXKQagL
NVS1jtHoGZMJA29gADtEXvncO44eiNxEdFntbntYfUtWRR1qoKRgXiZCZHL/NP6X
CNWDOSynE/maGlKGXXKCaDeG025xqn2w/qxd
-----END CERTIFICATE-----`;

const OID_NAMES: Record<
  string,
  string
> = {
  "2.5.4.3": "CN",
  "2.5.4.6": "C",
  "2.5.4.7": "L",
  "2.5.4.8": "ST",
  "2.5.4.10": "O",
  "2.5.4.11": "OU",
  "1.2.840.113549.1.9.1":
    "emailAddress",
};

const ALGORITHM_NAMES: Record<
  string,
  string
> = {
  "1.2.840.113549.1.1.1":
    "RSA encryption",
  "1.2.840.113549.1.1.5":
    "sha1WithRSAEncryption",
  "1.2.840.113549.1.1.11":
    "sha256WithRSAEncryption",
  "1.2.840.113549.1.1.12":
    "sha384WithRSAEncryption",
  "1.2.840.113549.1.1.13":
    "sha512WithRSAEncryption",
  "1.2.840.10045.2.1":
    "EC public key",
  "1.2.840.10045.4.3.2":
    "ecdsa-with-SHA256",
  "1.2.840.10045.4.3.3":
    "ecdsa-with-SHA384",
  "1.2.840.10045.4.3.4":
    "ecdsa-with-SHA512",
  "1.3.101.112": "Ed25519",
  "1.3.101.113": "Ed448",
};

function hex(
  value: number,
  width: number
) {
  return value
    .toString(16)
    .toUpperCase()
    .padStart(width, "0");
}

function bytesToHex(
  bytes: Uint8Array
) {
  return Array.from(bytes)
    .map(
      (byte) => hex(byte, 2)
    )
    .join("");
}

function sliceBytes(
  bytes: Uint8Array,
  start: number,
  end: number
) {
  return bytes.slice(
    start,
    end
  );
}

function readTag(
  bytes: Uint8Array,
  offset: number,
  limit: number
) {
  if (offset >= limit) {
    throw new Error(
      "ASN.1 tag begins outside the available DER data."
    );
  }

  const first =
    bytes[offset];
  const tagClass =
    first >> 6;
  const constructed =
    Boolean(first & 0x20);
  let tag =
    first & 0x1f;
  let cursor =
    offset + 1;

  if (tag === 0x1f) {
    tag = 0;
    let count = 0;

    while (cursor < limit) {
      const byte =
        bytes[cursor];
      cursor += 1;
      count += 1;

      if (count > 5) {
        throw new Error(
          "ASN.1 high-tag-number form is too large for browser-side inspection."
        );
      }

      tag =
        tag * 128 +
        (byte & 0x7f);

      if (
        (byte & 0x80) ===
        0
      ) {
        break;
      }
    }

    if (
      cursor > limit ||
      (bytes[cursor - 1] &
        0x80) !==
        0
    ) {
      throw new Error(
        "ASN.1 high-tag-number form is truncated."
      );
    }
  }

  return {
    tagClass,
    constructed,
    tag,
    cursor,
  };
}

function readLength(
  bytes: Uint8Array,
  offset: number,
  limit: number
) {
  if (offset >= limit) {
    throw new Error(
      "ASN.1 length is missing."
    );
  }

  const first =
    bytes[offset];

  if (
    (first & 0x80) ===
    0
  ) {
    return {
      length: first,
      cursor: offset + 1,
    };
  }

  const count =
    first & 0x7f;

  if (count === 0) {
    throw new Error(
      "Indefinite-length BER is not DER and is not supported for X.509 certificate parsing."
    );
  }

  if (
    count > 4 ||
    offset + 1 + count >
      limit
  ) {
    throw new Error(
      "ASN.1 length field is truncated or unreasonably large."
    );
  }

  let length = 0;

  for (
    let index = 0;
    index < count;
    index += 1
  ) {
    length =
      length * 256 +
      bytes[
        offset + 1 + index
      ];
  }

  return {
    length,
    cursor:
      offset + 1 + count,
  };
}

function parseAsn1Node(
  bytes: Uint8Array,
  offset: number,
  limit: number,
  depth: number
): Asn1Node {
  if (depth > 40) {
    throw new Error(
      "ASN.1 nesting is deeper than the browser-side parser will inspect."
    );
  }

  const tagInfo =
    readTag(
      bytes,
      offset,
      limit
    );
  const lengthInfo =
    readLength(
      bytes,
      tagInfo.cursor,
      limit
    );
  const contentStart =
    lengthInfo.cursor;
  const end =
    contentStart +
    lengthInfo.length;

  if (end > limit) {
    throw new Error(
      "ASN.1 value length extends beyond the available DER bytes."
    );
  }

  const children: Asn1Node[] =
    [];

  if (tagInfo.constructed) {
    let cursor =
      contentStart;

    while (cursor < end) {
      const child =
        parseAsn1Node(
          bytes,
          cursor,
          end,
          depth + 1
        );
      children.push(child);

      if (
        child.end <= cursor
      ) {
        throw new Error(
          "ASN.1 parser made no forward progress."
        );
      }

      cursor = child.end;
    }

    if (cursor !== end) {
      throw new Error(
        "Constructed ASN.1 value does not end on a child boundary."
      );
    }
  }

  return {
    tagClass:
      tagInfo.tagClass,
    constructed:
      tagInfo.constructed,
    tag: tagInfo.tag,
    start: offset,
    contentStart,
    end,
    children,
  };
}

function parseDerRoot(
  bytes: Uint8Array
) {
  const root =
    parseAsn1Node(
      bytes,
      0,
      bytes.length,
      0
    );

  if (root.end !== bytes.length) {
    throw new Error(
      "Extra DER bytes exist after the top-level ASN.1 value."
    );
  }

  return root;
}

function asciiValue(
  bytes: Uint8Array,
  node: Asn1Node
) {
  return Array.from(
    sliceBytes(
      bytes,
      node.contentStart,
      node.end
    )
  )
    .map((byte) =>
      String.fromCharCode(
        byte
      )
    )
    .join("");
}

function decodeBmpString(
  bytes: Uint8Array
) {
  if (
    bytes.length % 2 !==
    0
  ) {
    return "";
  }

  let output = "";

  for (
    let index = 0;
    index < bytes.length;
    index += 2
  ) {
    output +=
      String.fromCharCode(
        bytes[index] * 256 +
          bytes[index + 1]
      );
  }

  return output;
}

function decodeAsn1String(
  bytes: Uint8Array,
  node: Asn1Node
) {
  const content =
    sliceBytes(
      bytes,
      node.contentStart,
      node.end
    );

  if (
    node.tagClass !== 0
  ) {
    return "";
  }

  if (node.tag === 12) {
    try {
      return new TextDecoder(
        "utf-8",
        {
          fatal: true,
        }
      ).decode(content);
    } catch {
      return new TextDecoder(
        "utf-8"
      ).decode(content);
    }
  }

  if (
    node.tag === 19 ||
    node.tag === 20 ||
    node.tag === 22 ||
    node.tag === 26 ||
    node.tag === 18
  ) {
    return Array.from(
      content
    )
      .map((byte) =>
        String.fromCharCode(
          byte
        )
      )
      .join("");
  }

  if (node.tag === 30) {
    return decodeBmpString(
      content
    );
  }

  return "";
}

function decodeOid(
  bytes: Uint8Array,
  node: Asn1Node
) {
  if (
    node.tagClass !== 0 ||
    node.tag !== 6
  ) {
    return "";
  }

  const content =
    sliceBytes(
      bytes,
      node.contentStart,
      node.end
    );

  if (!content.length) {
    return "";
  }

  const first =
    content[0];
  const firstArc =
    Math.min(
      2,
      Math.floor(
        first / 40
      )
    );
  const arcs: number[] = [
    firstArc,
    first -
      firstArc * 40,
  ];
  let value = 0;

  for (
    let index = 1;
    index < content.length;
    index += 1
  ) {
    const byte =
      content[index];
    value =
      value * 128 +
      (byte & 0x7f);

    if (
      (byte & 0x80) ===
      0
    ) {
      arcs.push(value);
      value = 0;
    }
  }

  if (
    content.length > 1 &&
    (content[
      content.length - 1
    ] &
      0x80) !==
      0
  ) {
    return "";
  }

  return arcs.join(".");
}

function algorithmName(
  bytes: Uint8Array,
  node: Asn1Node
) {
  if (!node.children.length) {
    return "";
  }

  const oid =
    decodeOid(
      bytes,
      node.children[0]
    );

  return oid
    ? ALGORITHM_NAMES[oid] ||
        oid
    : "";
}

function integerHex(
  bytes: Uint8Array,
  node: Asn1Node
) {
  const value =
    sliceBytes(
      bytes,
      node.contentStart,
      node.end
    );
  let start = 0;

  while (
    start <
      value.length - 1 &&
    value[start] === 0
  ) {
    start += 1;
  }

  const clean =
    value.slice(start);
  const hexValue =
    bytesToHex(clean);

  if (!hexValue) {
    return "00";
  }

  return hexValue.match(
    /.{1,2}/g
  )
    ? (
        hexValue.match(
          /.{1,2}/g
        ) as string[]
      ).join(":")
    : hexValue;
}

function parseName(
  bytes: Uint8Array,
  node: Asn1Node
) {
  const parts: string[] = [];

  node.children.forEach(
    (setNode) => {
      setNode.children.forEach(
        (sequence) => {
          if (
            sequence.children
              .length < 2
          ) {
            return;
          }

          const oid =
            decodeOid(
              bytes,
              sequence.children[0]
            );
          const value =
            decodeAsn1String(
              bytes,
              sequence.children[1]
            );

          if (
            oid &&
            value
          ) {
            parts.push(
              `${
                OID_NAMES[
                  oid
                ] || oid
              }=${value}`
            );
          }
        }
      );
    }
  );

  return parts.join(", ");
}

function parseTimeString(
  value: string,
  generalized: boolean
) {
  const match = generalized
    ? value.match(
        /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(?:\.\d+)?(Z|[+-]\d{4})$/
      )
    : value.match(
        /^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(Z|[+-]\d{4})$/
      );

  if (!match) {
    return null;
  }

  let year =
    Number(match[1]);

  if (!generalized) {
    year =
      year >= 50
        ? 1900 + year
        : 2000 + year;
  }

  const month =
    Number(match[2]);
  const day =
    Number(match[3]);
  const hour =
    Number(match[4]);
  const minute =
    Number(match[5]);
  const second =
    Number(match[6]);
  const zone =
    match[7];

  let millis =
    Date.UTC(
      year,
      month - 1,
      day,
      hour,
      minute,
      second
    );

  if (zone !== "Z") {
    const sign =
      zone.charAt(0) === "+"
        ? 1
        : -1;
    const zoneHours =
      Number(
        zone.slice(1, 3)
      );
    const zoneMinutes =
      Number(
        zone.slice(3, 5)
      );

    millis -=
      sign *
      (zoneHours * 60 +
        zoneMinutes) *
      60000;
  }

  const date =
    new Date(millis);

  return Number.isNaN(
    date.getTime()
  )
    ? null
    : date;
}

function parseAsn1Time(
  bytes: Uint8Array,
  node: Asn1Node
) {
  if (
    node.tagClass !== 0 ||
    (node.tag !== 23 &&
      node.tag !== 24)
  ) {
    return {
      raw: "",
      date: null as Date | null,
    };
  }

  const raw =
    asciiValue(
      bytes,
      node
    );

  return {
    raw,
    date:
      parseTimeString(
        raw,
        node.tag === 24
      ),
  };
}

function dateLabel(
  value: Date | null,
  raw: string
) {
  if (value) {
    return value
      .toISOString();
  }

  return raw ||
    "Unable to decode";
}

function parseSanExtension(
  bytes: Uint8Array,
  octetNode: Asn1Node
) {
  const innerBytes =
    sliceBytes(
      bytes,
      octetNode.contentStart,
      octetNode.end
    );
  const root =
    parseDerRoot(
      innerBytes
    );
  const names: string[] =
    [];

  root.children.forEach(
    (name) => {
      if (
        name.tagClass !== 2
      ) {
        return;
      }

      const content =
        sliceBytes(
          innerBytes,
          name.contentStart,
          name.end
        );

      if (
        name.tag === 2
      ) {
        names.push(
          `DNS:${Array.from(
            content
          )
            .map((byte) =>
              String.fromCharCode(
                byte
              )
            )
            .join("")}`
        );
      } else if (
        name.tag === 6
      ) {
        names.push(
          `URI:${Array.from(
            content
          )
            .map((byte) =>
              String.fromCharCode(
                byte
              )
            )
            .join("")}`
        );
      } else if (
        name.tag === 7
      ) {
        if (
          content.length ===
          4
        ) {
          names.push(
            `IP:${Array.from(
              content
            ).join(".")}`
          );
        } else if (
          content.length ===
          16
        ) {
          const groups: string[] =
            [];

          for (
            let index = 0;
            index < 16;
            index += 2
          ) {
            groups.push(
              (
                content[index] *
                  256 +
                content[
                  index + 1
                ]
              ).toString(16)
            );
          }

          names.push(
            `IP:${groups.join(
              ":"
            )}`
          );
        }
      }
    }
  );

  return names;
}

function parseBasicConstraints(
  bytes: Uint8Array,
  octetNode: Asn1Node
) {
  try {
    const inner =
      sliceBytes(
        bytes,
        octetNode.contentStart,
        octetNode.end
      );
    const root =
      parseDerRoot(inner);
    let ca = false;
    let pathLength = "";

    root.children.forEach(
      (child) => {
        if (
          child.tagClass ===
            0 &&
          child.tag === 1
        ) {
          ca =
            child.end >
              child.contentStart &&
            inner[
              child.contentStart
            ] !== 0;
        }

        if (
          child.tagClass ===
            0 &&
          child.tag === 2
        ) {
          const value =
            sliceBytes(
              inner,
              child.contentStart,
              child.end
            );
          let number = 0;

          value.forEach(
            (byte) => {
              number =
                number * 256 +
                byte;
            }
          );

          pathLength =
            String(number);
        }
      }
    );

    return `CA=${ca ? "true" : "false"}${
      pathLength
        ? `, pathLen=${pathLength}`
        : ""
    }`;
  } catch {
    return "";
  }
}

function findExtensions(
  tbs: Asn1Node
) {
  for (
    let index = 0;
    index < tbs.children.length;
    index += 1
  ) {
    const child =
      tbs.children[index];

    if (
      child.tagClass === 2 &&
      child.tag === 3
    ) {
      return child;
    }
  }

  return null;
}

function parseExtensions(
  bytes: Uint8Array,
  tbs: Asn1Node
) {
  const extensionWrapper =
    findExtensions(tbs);
  const sans: string[] = [];
  let basicConstraints = "";

  if (
    !extensionWrapper ||
    !extensionWrapper
      .children.length
  ) {
    return {
      sans,
      basicConstraints,
    };
  }

  const sequence =
    extensionWrapper
      .children[0];

  sequence.children.forEach(
    (extension) => {
      if (
        extension.children
          .length < 2
      ) {
        return;
      }

      const oid =
        decodeOid(
          bytes,
          extension.children[0]
        );
      let octet:
        | Asn1Node
        | null = null;

      for (
        let index = 1;
        index <
        extension.children
          .length;
        index += 1
      ) {
        const child =
          extension.children[
            index
          ];

        if (
          child.tagClass ===
            0 &&
          child.tag === 4
        ) {
          octet = child;
          break;
        }
      }

      if (!octet) return;

      if (
        oid ===
        "2.5.29.17"
      ) {
        try {
          parseSanExtension(
            bytes,
            octet
          ).forEach(
            (name) =>
              sans.push(name)
          );
        } catch {
          // Keep the rest of the certificate useful.
        }
      }

      if (
        oid ===
        "2.5.29.19"
      ) {
        basicConstraints =
          parseBasicConstraints(
            bytes,
            octet
          );
      }
    }
  );

  return {
    sans,
    basicConstraints,
  };
}

function parseX509Certificate(
  bytes: Uint8Array
): X509Summary {
  const root =
    parseDerRoot(bytes);

  if (
    root.tagClass !== 0 ||
    root.tag !== 16 ||
    root.children.length < 3
  ) {
    throw new Error(
      "Top-level DER value does not have the expected X.509 Certificate SEQUENCE shape."
    );
  }

  const tbs =
    root.children[0];

  if (
    tbs.tagClass !== 0 ||
    tbs.tag !== 16
  ) {
    throw new Error(
      "TBSCertificate SEQUENCE was not found."
    );
  }

  let index = 0;
  let version = "v1";

  if (
    tbs.children.length &&
    tbs.children[0]
      .tagClass === 2 &&
    tbs.children[0].tag ===
      0
  ) {
    const wrapper =
      tbs.children[0];

    if (
      wrapper.children.length &&
      wrapper.children[0]
        .tagClass === 0 &&
      wrapper.children[0]
        .tag === 2
    ) {
      const versionBytes =
        sliceBytes(
          bytes,
          wrapper.children[0]
            .contentStart,
          wrapper.children[0]
            .end
        );
      let versionNumber = 0;

      versionBytes.forEach(
        (byte) => {
          versionNumber =
            versionNumber * 256 +
            byte;
        }
      );

      version = `v${
        versionNumber + 1
      }`;
    }

    index += 1;
  }

  const serial =
    tbs.children[index];
  const signature =
    tbs.children[index + 1];
  const issuer =
    tbs.children[index + 2];
  const validity =
    tbs.children[index + 3];
  const subject =
    tbs.children[index + 4];
  const spki =
    tbs.children[index + 5];

  if (
    !serial ||
    !signature ||
    !issuer ||
    !validity ||
    !subject ||
    !spki
  ) {
    throw new Error(
      "Certificate TBSCertificate fields are incomplete."
    );
  }

  const validityChildren =
    validity.children;
  const notBefore =
    validityChildren.length
      ? parseAsn1Time(
          bytes,
          validityChildren[0]
        )
      : {
          raw: "",
          date: null as Date | null,
        };
  const notAfter =
    validityChildren.length >
      1
      ? parseAsn1Time(
          bytes,
          validityChildren[1]
        )
      : {
          raw: "",
          date: null as Date | null,
        };

  let validityState =
    "Unable to determine";

  if (
    notBefore.date &&
    notAfter.date
  ) {
    const now =
      Date.now();

    if (
      now <
      notBefore.date.getTime()
    ) {
      validityState =
        "Not yet valid by this browser's current clock";
    } else if (
      now >
      notAfter.date.getTime()
    ) {
      validityState =
        "Expired by this browser's current clock";
    } else {
      validityState =
        "Within encoded validity interval by this browser's current clock";
    }
  }

  const outerSignature =
    root.children[1];
  const signatureAlgorithm =
    algorithmName(
      bytes,
      outerSignature
    ) ||
    algorithmName(
      bytes,
      signature
    );

  let publicKeyAlgorithm = "";

  if (
    spki.children.length
  ) {
    publicKeyAlgorithm =
      algorithmName(
        bytes,
        spki.children[0]
      );
  }

  const extensionInfo =
    parseExtensions(
      bytes,
      tbs
    );

  return {
    version,
    serialNumber:
      serial.tag === 2
        ? integerHex(
            bytes,
            serial
          )
        : "Unable to decode",
    issuer:
      parseName(
        bytes,
        issuer
      ) ||
      "Unable to decode",
    subject:
      parseName(
        bytes,
        subject
      ) ||
      "Unable to decode",
    notBefore:
      dateLabel(
        notBefore.date,
        notBefore.raw
      ),
    notAfter:
      dateLabel(
        notAfter.date,
        notAfter.raw
      ),
    validityState,
    signatureAlgorithm:
      signatureAlgorithm ||
      "Unable to decode",
    publicKeyAlgorithm:
      publicKeyAlgorithm ||
      "Unable to decode",
    subjectAlternativeNames:
      extensionInfo.sans,
    basicConstraints:
      extensionInfo
        .basicConstraints ||
      "Not decoded / not present",
  };
}

function strictBase64Body(
  body: string,
  label: string
) {
  const compact =
    body.replace(
      /\s+/g,
      ""
    );

  if (!compact) {
    throw new Error(
      `${label} block contains no Base64 data.`
    );
  }

  if (
    !/^[A-Za-z0-9+/]+={0,2}$/.test(
      compact
    ) ||
    compact.length % 4 !==
      0
  ) {
    throw new Error(
      `${label} block does not contain strict padded Base64 suitable for DER inspection.`
    );
  }

  const firstPadding =
    compact.indexOf("=");

  if (
    firstPadding !== -1 &&
    firstPadding <
      compact.length - 2
  ) {
    throw new Error(
      `${label} block contains Base64 padding before the end of the encoded data.`
    );
  }

  return compact;
}

function decodeBase64(
  value: string
) {
  try {
    const binary =
      atob(value);
    const bytes =
      new Uint8Array(
        binary.length
      );

    for (
      let index = 0;
      index <
      binary.length;
      index += 1
    ) {
      bytes[index] =
        binary.charCodeAt(
          index
        );
    }

    return bytes;
  } catch {
    throw new Error(
      "Invalid Base64 content inside the PEM block."
    );
  }
}

async function sha256Fingerprint(
  bytes: Uint8Array
) {
  const buffer =
    bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset +
        bytes.byteLength
    ) as ArrayBuffer;
  const digest =
    await crypto.subtle.digest(
      "SHA-256",
      buffer
    );
  const hexValue =
    bytesToHex(
      new Uint8Array(
        digest
      )
    );
  const pairs =
    hexValue.match(/.{2}/g);

  return pairs
    ? pairs.join(":")
    : hexValue;
}

function readableBytePreview(
  bytes: Uint8Array
) {
  const limit =
    Math.min(
      bytes.length,
      600
    );
  let output = "";
  let readable = 0;

  for (
    let index = 0;
    index < limit;
    index += 1
  ) {
    const byte =
      bytes[index];

    if (
      byte >= 0x20 &&
      byte <= 0x7e
    ) {
      output +=
        String.fromCharCode(
          byte
        );
      readable += 1;
    } else if (
      byte === 0x09 ||
      byte === 0x0a ||
      byte === 0x0d
    ) {
      output +=
        String.fromCharCode(
          byte
        );
      readable += 1;
    } else {
      output += ".";
    }
  }

  return (
    limit &&
    readable / limit >=
      0.18
  )
    ? output
    : "";
}

function isPrivateKeyLabel(
  label: string
) {
  return (
    label.indexOf(
      "PRIVATE KEY"
    ) !== -1
  );
}

function blockKind(
  label: string
) {
  if (
    label === "CERTIFICATE"
  ) {
    return "X.509 certificate";
  }

  if (
    label ===
      "CERTIFICATE REQUEST" ||
    label ===
      "NEW CERTIFICATE REQUEST"
  ) {
    return "Certificate signing request";
  }

  if (
    label.indexOf(
      "PRIVATE KEY"
    ) !== -1
  ) {
    return "Private key material";
  }

  if (
    label.indexOf(
      "PUBLIC KEY"
    ) !== -1
  ) {
    return "Public key material";
  }

  if (
    label === "X509 CRL"
  ) {
    return "X.509 certificate revocation list";
  }

  return "PEM-encoded binary data";
}

async function parsePemBlocks(
  source: string
): Promise<PemReport> {
  const beginPattern =
    /^-----BEGIN ([A-Z0-9][A-Z0-9 -]*[A-Z0-9])-----[ \t]*$/gm;
  const begins: Array<{
    label: string;
    start: number;
    contentStart: number;
  }> = [];
  let beginMatch:
    | RegExpExecArray
    | null;

  while (
    (beginMatch =
      beginPattern.exec(
        source
      )) !== null
  ) {
    begins.push({
      label:
        beginMatch[1],
      start:
        beginMatch.index,
      contentStart:
        beginPattern
          .lastIndex,
    });
  }

  if (!begins.length) {
    throw new Error(
      "No RFC 7468-style BEGIN boundary was found."
    );
  }

  const blocks: PemBlock[] =
    [];
  const reportWarnings: string[] =
    [];
  let privateKeyBlocks = 0;
  let certificateBlocks = 0;

  for (
    let blockIndex = 0;
    blockIndex <
    begins.length;
    blockIndex += 1
  ) {
    const begin =
      begins[blockIndex];

    if (
      / {2}|--/.test(
        begin.label
      )
    ) {
      throw new Error(
        `PEM label "${begin.label}" contains consecutive spaces or hyphens, which is outside RFC 7468's recommended label grammar.`
      );
    }

    const escapedLabel =
      begin.label.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );
    const endPattern =
      new RegExp(
        `^-----END ${escapedLabel}-----[ \\t]*$`,
        "gm"
      );
    endPattern.lastIndex =
      begin.contentStart;
    const endMatch =
      endPattern.exec(source);
    const nextBegin =
      blockIndex + 1 <
      begins.length
        ? begins[
            blockIndex + 1
          ].start
        : source.length;

    if (
      !endMatch ||
      endMatch.index >
        nextBegin
    ) {
      throw new Error(
        `${begin.label} block does not have a matching END ${begin.label} boundary before the next PEM block.`
      );
    }

    const rawBody =
      source.slice(
        begin.contentStart,
        endMatch.index
      );
    const base64 =
      strictBase64Body(
        rawBody,
        begin.label
      );
    const bytes =
      decodeBase64(
        base64
      );
    const fingerprint =
      await sha256Fingerprint(
        bytes
      );
    const warnings: string[] =
      [];
    let x509:
      | X509Summary
      | null = null;

    if (
      begin.label ===
      "CERTIFICATE"
    ) {
      certificateBlocks += 1;

      try {
        x509 =
          parseX509Certificate(
            bytes
          );
      } catch (caught) {
        warnings.push(
          `The PEM/Base64 block decoded, but the X.509 field parser could not interpret the DER certificate: ${
            caught instanceof
            Error
              ? caught.message
              : "unknown ASN.1 error"
          }`
        );
      }
    }

    if (
      isPrivateKeyLabel(
        begin.label
      )
    ) {
      privateKeyBlocks += 1;
      warnings.push(
        "Private-key material is present. Decoded private-key bytes are intentionally not displayed or exported."
      );
    }

    blocks.push({
      type:
        begin.label,
      byteLength:
        bytes.length,
      base64Length:
        base64.length,
      fingerprint,
      readablePreview:
        isPrivateKeyLabel(
          begin.label
        )
          ? ""
          : readableBytePreview(
              bytes
            ),
      x509,
      warnings,
    });
  }

  if (
    privateKeyBlocks
  ) {
    reportWarnings.push(
      "One or more private-key blocks were pasted. Even with local processing, avoid placing production private keys in unnecessary tools, screenshots, browser history, clipboard history, logs, or shared sessions."
    );
  }

  if (
    certificateBlocks > 1
  ) {
    reportWarnings.push(
      "Multiple certificate blocks were found. Their order may represent a leaf/intermediate chain, but chain order, signatures, trust anchors, revocation, and path building are not validated."
    );
  }

  reportWarnings.push(
    "A SHA-256 fingerprint identifies the exact decoded DER bytes. Matching fingerprints prove byte-for-byte certificate identity, not that a certificate is trusted for a hostname."
  );

  return {
    blocks,
    warnings:
      reportWarnings,
    privateKeyBlocks,
    certificateBlocks,
  };
}

function formatX509(
  value: X509Summary
) {
  return [
    `Version: ${value.version}`,
    `Serial: ${value.serialNumber}`,
    `Subject: ${value.subject}`,
    `Issuer: ${value.issuer}`,
    `Not before: ${value.notBefore}`,
    `Not after: ${value.notAfter}`,
    `Validity interval: ${value.validityState}`,
    `Signature algorithm: ${value.signatureAlgorithm}`,
    `Public-key algorithm: ${value.publicKeyAlgorithm}`,
    `Basic constraints: ${value.basicConstraints}`,
    `Subject Alternative Names: ${
      value
        .subjectAlternativeNames
        .length
        ? value.subjectAlternativeNames.join(
            ", "
          )
        : "Not decoded / not present"
    }`,
  ];
}

function formatPemReport(
  report: PemReport
) {
  const lines = [
    "PEM inspection",
    `Blocks: ${report.blocks.length}`,
    `Certificates: ${report.certificateBlocks}`,
    `Private-key blocks: ${report.privateKeyBlocks}`,
    "",
  ];

  report.blocks.forEach(
    (block, index) => {
      lines.push(
        `Block ${index + 1}: ${block.type}`,
        `Kind: ${blockKind(
          block.type
        )}`,
        `Base64 characters: ${block.base64Length}`,
        `Decoded DER/binary bytes: ${block.byteLength}`,
        `SHA-256 fingerprint: ${block.fingerprint}`
      );

      if (
        block.readablePreview
      ) {
        lines.push(
          "Readable byte preview:",
          block.readablePreview
        );
      }

      if (block.x509) {
        lines.push(
          ...formatX509(
            block.x509
          )
        );
      }

      block.warnings.forEach(
        (warning) =>
          lines.push(
            `Warning: ${warning}`
          )
      );

      lines.push("");
    }
  );

  if (report.warnings.length) {
    lines.push(
      "Report notes:",
      ...report.warnings.map(
        (warning) =>
          `- ${warning}`
      )
    );
  }

  lines.push(
    "",
    "Boundary: browser-side inspection does not establish certificate trust, validate signatures or chains, check revocation, prove hostname coverage, or verify that a private key matches a certificate."
  );

  return lines.join("\n");
}

export default function ToolClient() {
  const [input, setInput] =
    useState("");
  const [report, setReport] =
    useState<PemReport | null>(
      null
    );
  const [error, setError] =
    useState("");
  const [copied, setCopied] =
    useState(false);

  const clearResult = () => {
    setReport(null);
    setError("");
    setCopied(false);
  };

  const inspectCertificate =
    async () => {
      if (!input.trim()) {
        setError(
          "Paste one or more PEM blocks to inspect."
        );
        setReport(null);
        return;
      }

      try {
        const next =
          await parsePemBlocks(
            input
          );
        setReport(next);
        setError("");
        setCopied(false);
      } catch (caught) {
        setReport(null);
        setError(
          caught instanceof Error
            ? caught.message
            : "Unable to inspect this PEM input."
        );
        setCopied(false);
      }
    };

  const loadExample = () => {
    setInput(SAMPLE_PEM);
    clearResult();
  };

  const resetAll = () => {
    setInput("");
    clearResult();
  };

  const copyReport = async () => {
    if (!report) return;

    try {
      await navigator.clipboard.writeText(
        formatPemReport(
          report
        )
      );
      setCopied(true);
      window.setTimeout(
        () => setCopied(false),
        1400
      );
    } catch {
      setCopied(false);
      setError(
        "The PEM report could not be copied. Select and copy it manually."
      );
    }
  };

  return (
    <ToolShell
      title="PEM Certificate Viewer"
      description="Inspect PEM certificates for boundaries, X.509 fields, validity, SANs, algorithms, and fingerprints without claiming trust validation."
    >
      <div>
        <label htmlFor="pem-input" className="block text-sm font-semibold text-gray-900">
          PEM input
        </label>
        <textarea
          id="pem-input"
          value={input}
          onChange={(event: {
            target: {
              value: string;
            };
          }) => {
            setInput(
              event.target.value
            );
            clearResult();
          }}
          placeholder={SAMPLE_PEM}
          spellCheck={false}
          className="mt-2 w-full min-h-[360px] rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Accepts certificate, certificate-request, public-key, private-key,
          CRL, and other RFC 7468-style PEM blocks. Avoid unnecessary handling
          of production private keys.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={
            inspectCertificate
          }
          className="yoryantra-btn shrink-0 whitespace-nowrap"
        >
          Inspect PEM
        </button>
        <button
          type="button"
          onClick={
            loadExample
          }
          className="yoryantra-btn-outline shrink-0 whitespace-nowrap"
        >
          Load Certificate Example
        </button>
        <button
          type="button"
          onClick={resetAll}
          className="yoryantra-btn-outline shrink-0 whitespace-nowrap"
        >
          Reset
        </button>
      </div>

      {error ? (
        <div role="alert" className="mt-6 whitespace-pre-wrap rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      ) : null}

      {report ? (
        <div className="mt-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat
              label="PEM blocks"
              value={String(
                report.blocks.length
              )}
            />
            <Stat
              label="Certificates"
              value={String(
                report.certificateBlocks
              )}
            />
            <Stat
              label="Private-key blocks"
              value={String(
                report.privateKeyBlocks
              )}
            />
          </div>

          {report.warnings.length ? (
            <div className="mt-5 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-relaxed text-yellow-900">
              <strong>
                Inspection boundaries:
              </strong>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                {report.warnings.map(
                  (
                    warning,
                    index
                  ) => (
                    <li
                      key={`${warning}-${index}`}
                    >
                      {warning}
                    </li>
                  )
                )}
              </ul>
            </div>
          ) : null}

          <div className="mt-6 space-y-6">
            {report.blocks.map(
              (block, index) => (
                <div
                  key={`${block.type}-${index}`}
                  className="rounded-2xl border border-gray-200 bg-white p-5"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Block{" "}
                        {index + 1}
                      </div>
                      <h3 className="mt-1 text-lg font-semibold text-gray-900">
                        {block.type}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {blockKind(
                          block.type
                        )}
                      </p>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      {block.byteLength.toLocaleString()} decoded bytes
                    </div>
                  </div>

                  <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      SHA-256 fingerprint
                    </div>
                    <code className="mt-2 block break-all text-sm text-gray-800">
                      {block.fingerprint}
                    </code>
                  </div>

                  {block.readablePreview ? (
                    <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Readable byte preview
                      </div>
                      <pre className="mt-2 max-h-[180px] overflow-auto whitespace-pre-wrap break-words font-mono text-xs leading-5 text-gray-700">
                        {block.readablePreview}
                      </pre>
                      <p className="mt-2 text-xs leading-relaxed text-gray-500">
                        This is only a printable-byte diagnostic preview, not an
                        ASN.1 field decoder. Private-key blocks never receive
                        this preview.
                      </p>
                    </div>
                  ) : null}

                  {block.x509 ? (
                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      <Info
                        label="Version"
                        value={
                          block.x509
                            .version
                        }
                      />
                      <Info
                        label="Serial number"
                        value={
                          block.x509
                            .serialNumber
                        }
                      />
                      <Info
                        label="Subject"
                        value={
                          block.x509
                            .subject
                        }
                      />
                      <Info
                        label="Issuer"
                        value={
                          block.x509
                            .issuer
                        }
                      />
                      <Info
                        label="Not before"
                        value={
                          block.x509
                            .notBefore
                        }
                      />
                      <Info
                        label="Not after"
                        value={
                          block.x509
                            .notAfter
                        }
                      />
                      <Info
                        label="Validity interval"
                        value={
                          block.x509
                            .validityState
                        }
                      />
                      <Info
                        label="Signature algorithm"
                        value={
                          block.x509
                            .signatureAlgorithm
                        }
                      />
                      <Info
                        label="Public-key algorithm"
                        value={
                          block.x509
                            .publicKeyAlgorithm
                        }
                      />
                      <Info
                        label="Basic constraints"
                        value={
                          block.x509
                            .basicConstraints
                        }
                      />
                      <div className="md:col-span-2">
                        <Info
                          label="Subject Alternative Names"
                          value={
                            block.x509
                              .subjectAlternativeNames
                              .length
                              ? block.x509.subjectAlternativeNames.join(
                                  "\n"
                                )
                              : "Not decoded / not present"
                          }
                        />
                      </div>
                    </div>
                  ) : null}

                  {block.warnings.length ? (
                    <div className="mt-5 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-relaxed text-yellow-900">
                      <ul className="list-disc space-y-2 pl-5">
                        {block.warnings.map(
                          (
                            warning,
                            warningIndex
                          ) => (
                            <li
                              key={`${warning}-${warningIndex}`}
                            >
                              {warning}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  ) : null}
                </div>
              )
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={copyReport}
              className="yoryantra-btn-outline shrink-0 whitespace-nowrap"
            >
              {copied
                ? "Copied"
                : "Copy Report"}
            </button>
          </div>
        </div>
      ) : (
        <pre className="yoryantra-output mt-8 min-h-[280px] overflow-auto whitespace-pre-wrap break-words text-sm">
          PEM boundaries, decoded size, SHA-256 fingerprint, and available X.509
          certificate fields will appear here.
        </pre>
      )}

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        PEM/Base64 decoding, SHA-256 hashing and certificate field inspection
        happen on the pasted data in your browser. The tool does not send PEM
        material to a certificate service. Site-wide analytics or advertising
        scripts, if enabled, are separate from this inspection operation.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            PEM Is the Envelope; DER and ASN.1 Explain What Is Inside It
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The familiar BEGIN/END lines do not themselves contain certificate
            fields. RFC 7468 describes a textual envelope whose body is Base64
            representing binary structures such as X.509 certificates, public
            keys, certificate requests, CRLs, PKCS #8 private keys, and CMS
            objects.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            An X.509 certificate is normally represented in PEM by wrapping its
            DER-encoded ASN.1 Certificate value. The parser first verifies the
            envelope and Base64, then walks enough DER structure to expose the
            certificate fields that are most useful during debugging.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            RFC 7468 also documents deliberately tolerant parser behavior found
            in deployed software. Yoryantra uses a stricter Base64 body check so
            contamination or malformed padding is visible during inspection
            instead of being silently ignored. A legacy application can
            therefore accept input that this diagnostic viewer asks you to
            clean up.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            A Fingerprint Belongs to the Exact DER Bytes, Not to the Subject Name
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Two certificates can contain the same subject Common Name and still
            be completely different certificates. Their serials, issuers,
            validity windows, public keys, extensions, and signatures can all
            differ.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The SHA-256 fingerprint on this page hashes the entire decoded
            certificate DER value. When two independently obtained certificate
            copies have the same fingerprint, their encoded certificate bytes
            match. That still does not prove the certificate is trusted for your
            connection.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Subject and Issuer Names Are Helpful Labels, Not Hostname Validation
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            X.509 names can contain Common Name, organization, country and other
            attributes. For modern TLS hostname checks, the Subject Alternative
            Name extension is the important place to inspect DNS names and IP
            addresses.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Even seeing <code>DNS:example.com</code> in the SAN list is not a
            complete hostname-validation result. Wildcard rules, IDNA handling,
            name constraints, the exact requested hostname, path validation and
            trust all belong to the TLS/certificate-validation layer.
          </p>
        </div>

        <div className="mt-12 self-start rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-xl font-semibold text-yellow-900">
            “Not Expired” Is Only One Condition in Certificate Validation
          </h2>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            The browser clock can show whether the current time
            falls between the encoded <code>notBefore</code> and{" "}
            <code>notAfter</code> values. That is useful operational
            information, but a certificate inside its time window can still
            fail because the chain is untrusted, a signature is invalid, the
            hostname is wrong, the certificate is revoked, an extension
            disallows the use, or an intermediate is missing.
          </p>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            Treat the validity badge as “inside encoded dates according to this
            device clock,” not as “certificate valid.”
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            A Certificate Chain Is More Than Several CERTIFICATE Blocks in a File
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            TLS deployments often concatenate a leaf certificate with one or
            more intermediate CA certificates. A PEM file can therefore contain
            several CERTIFICATE blocks. The order matters to some server
            configurations, and the chain has cryptographic relationships that
            cannot be proven from labels alone.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Each certificate is shown independently. The browser-side inspection does not verify
            that certificate 1 was signed by certificate 2, build alternate
            paths to a trust anchor, or decide which root store a client uses.
            Use a real X.509 path validator or TLS client for those questions.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Basic Constraints Help Distinguish CA Certificates From Ordinary End-Entity Certificates
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The X.509 Basic Constraints extension contains a CA boolean and can
            optionally limit certification-path depth. A CA certificate used to
            sign other certificates normally needs the CA assertion and related
            key-usage semantics.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The parser decodes the common Basic Constraints shape when
            present. It does not evaluate the full interaction of Basic
            Constraints, Key Usage, Extended Key Usage, Name Constraints,
            policy extensions, critical-extension processing and the
            certificate path.
          </p>
        </div>

        <div className="mt-12 self-start rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-xl font-semibold text-yellow-900">
            Private-Key PEM Blocks Deserve a Different Handling Rule
          </h2>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            A certificate is designed to be shared. A private key is not.
            Browser-local processing reduces one category of exposure, but
            copying production key material into an unnecessary tool still
            increases the chance of leakage through clipboard history,
            screenshots, screen sharing, browser extensions, local logging, or
            accidental reuse in examples.
          </p>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            If a private-key block is pasted, Yoryantra reports its envelope,
            byte length and fingerprint but deliberately avoids a decoded-byte
            preview. Use purpose-built key tooling when you need key
            consistency or public/private matching.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Why a PEM File Can Open Successfully in One Tool and Fail in Another
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            RFC 7468 documents real-world parser variation around whitespace,
            labels, explanatory text and encapsulation formatting. On top of
            that, applications expect different inner structures: a web server
            may expect a certificate chain in one file and an unencrypted
            private key in another, while a Java workflow might use PKCS #12
            instead.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            When a PEM envelope looks correct but an application rejects it,
            verify the expected block label, the decoded object type, encryption
            requirements, key pairing, chain order, and the application&apos;s
            own file-format documentation.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <ReferenceCard
            title="RFC 7468"
            href="https://www.rfc-editor.org/rfc/rfc7468"
            text="Defines textual encapsulation boundaries and Base64 conventions for certificates, CRLs, CSRs, public/private keys and related PKIX/PKCS/CMS structures."
          />
          <ReferenceCard
            title="RFC 5280"
            href="https://www.rfc-editor.org/rfc/rfc5280"
            text="Defines the Internet X.509 certificate and CRL profile, including certificate fields, extensions, validity and path-validation requirements."
          />
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/pem-certificate-viewer" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-2 text-xl font-semibold text-gray-900">
        {value}
      </div>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-800">
        {value}
      </div>
    </div>
  );
}

function ReferenceCard({
  title,
  href,
  text,
}: {
  title: string;
  href: string;
  text: string;
}) {
  return (
    <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-5">
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="font-semibold text-[var(--green)] underline underline-offset-4"
      >
        {title}
      </a>
      <p className="mt-3 text-sm leading-relaxed text-gray-600">
        {text}
      </p>
    </div>
  );
}
