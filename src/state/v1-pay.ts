import { computed } from "@preact/signals";
import { omit } from "es-toolkit";
import { sdkVersionSignal } from "./app";
import { toJs } from "./code";
import {
	createConfigObjectSignal,
	createFieldSignals,
	createJsonSignals,
	resetFieldSignals,
} from "./fields";
import type { Fields } from "./fields";
import { prefix } from "./persisted";
import { createAccountSignals, sdkV1Signal } from "./v1";
import { fields as v2PayFields } from "./v2-pay";

export function reset() {
	resetFieldSignals(fields, fieldSignals);
	jsonTextSignal.value = "{}";
}

export const playFnSignal = computed(() => {
	const sdkV1 = sdkV1Signal.value;
	const userCode = fieldSignals.userCode.valueSignal.value;
	const configObject = configObjectSignal.value;
	return async function requestPay() {
		if (!sdkV1) throw new Error("sdk not loaded");
		if (!userCode) throw new Error("userCode is empty");
		const { IMP } = await sdkV1;
		accountSignals.impInit(IMP);
		return new Promise((resolve) => {
			IMP.request_pay(configObject, resolve);
		});
	};
});

export const codePreviewSignal = computed<string>(() => {
	const version = sdkVersionSignal.value;
	const accountCodePreview = accountSignals.codePreviewSignal.value;
	const configObject = omit(configObjectSignal.value, ["userCode", "tierCode"]);
	return [
		...(version === "1.3.0"
			? [`<script src="https://cdn.iamport.kr/v1/iamport.js"></script>`]
			: [
					`<script src="https://code.jquery.com/jquery-1.12.4.min.js"></script>`,
					`<script src="https://cdn.iamport.kr/js/iamport.payment-${version}.js"></script>`,
				]),
		"",
		`<button onclick="requestPay()">결제하기</button>`,
		"",
		"<script>",
		accountCodePreview,
		"",
		"function requestPay() {",
		`  IMP.request_pay(${toJs(configObject, "  ", 1)});`,
		"}",
		"</script>",
	].join("\n");
});

export const fields = {
	userCode: {
		required: true,
		label: "고객사 식별코드",
		input: {
			type: "text",
			placeholder: "imp00000000",
			default: "",
		},
	},
	tierCode: {
		required: false,
		label: "하위상점(Tier) 코드",
		input: {
			type: "text",
			placeholder: "000",
			default: "",
		},
	},
	channelKey: v2PayFields.channelKey,
	pay_method: {
		required: true,
		label: "결제 수단",
		input: {
			type: "text",
			placeholder: "card",
			default: "",
		},
	},
	escrow: {
		required: false,
		label: "에스크로 여부",
		input: {
			type: "toggle",
			default: false,
		},
	},
	merchant_uid: {
		required: true,
		label: "고객사 고유 주문 번호",
		input: {
			type: "text",
			default: "",
			placeholder: "",
			generate: () => `test_${Date.now().toString(36)}`,
		},
	},
	customer_uid: {
		required: false,
		label: "사용자 결제수단별 고유 ID",
		input: {
			type: "text",
			default: "",
			placeholder: "",
		},
	},
	name: {
		required: false,
		label: "주문명",
		input: {
			type: "text",
			default: "",
			placeholder: "짜장면 1개 단무지 추가",
		},
	},
	amount: {
		required: true,
		label: "금액",
		input: {
			type: "integer",
			default: 0,
		},
	},
	tax_free: {
		required: false,
		label: "면세공급가액",
		input: {
			type: "integer",
			default: 0,
		},
	},
	currency: {
		required: false,
		label: "통화",
		input: {
			type: "text",
			default: "",
			placeholder: "KRW | USD | EUR | JPY",
		},
	},
	language: {
		required: false,
		label: "결제창 언어설정",
		input: {
			type: "text",
			default: "",
			placeholder: "ko | en",
		},
	},
	popup: {
		required: false,
		label: "결제창 팝업여부",
		input: {
			type: "toggle",
			default: false,
		},
	},
	buyer_name: {
		required: false,
		label: "주문자명",
		input: {
			type: "text",
			default: "",
			placeholder: "원포트",
		},
	},
	buyer_tel: {
		required: true,
		label: "주문자 연락처",
		input: {
			type: "text",
			default: "",
			placeholder: "010-1234-5678",
		},
	},
	buyer_email: {
		required: false,
		label: "주문자 이메일",
		input: {
			type: "text",
			default: "",
			placeholder: "buyer@example.com",
		},
	},
	buyer_addr: {
		required: false,
		label: "주문자 주소",
		input: {
			type: "text",
			default: "",
			placeholder: "시군구읍면동",
		},
	},
	buyer_postcode: {
		required: false,
		label: "주문자 우편번호",
		input: {
			type: "text",
			default: "",
			placeholder: "01234",
		},
	},
	digital: {
		required: false,
		label: "디지털 컨텐츠 여부",
		input: {
			type: "toggle",
			default: false,
		},
	},
	vbank_due: {
		required: false,
		label: "가상계좌 입금기한",
		input: {
			type: "text",
			default: "",
			placeholder: "YYYYMMDDhhmm",
		},
	},
	m_redirect_url: {
		required: false,
		label: "결제완료 후에 이동할 URL",
		input: {
			type: "text",
			default: "",
			placeholder: "https://example.com",
		},
	},
	notice_url: {
		required: false,
		label: "웹훅 URL",
		input: {
			type: "text",
			default: "",
			placeholder: "https://example.com",
		},
	},
	app_scheme: {
		required: false,
		label: "앱 복귀를 위한 URL",
		input: {
			type: "text",
			default: "",
			placeholder: "iamport://",
		},
	},
	period: {
		required: false,
		label: "제공 기간",
		input: {
			type: "object",
			fields: {
				from: {
					required: true,
					label: "시작일자",
					input: {
						type: "text",
						placeholder: "YYYYMMDD",
						default: "",
					},
				},
				to: {
					required: true,
					label: "종료일자",
					input: {
						type: "text",
						placeholder: "YYYYMMDD",
						default: "",
					},
				},
			},
		},
	},
	biz_num: {
		required: false,
		label: "사업자등록번호",
		input: {
			type: "text",
			default: "",
			placeholder: "0000000000",
		},
	},
} as const satisfies Fields;

export const fieldSignals = createFieldSignals(
	localStorage,
	`${prefix}.v1-pay.fields`,
	fields,
);
export const accountSignals = createAccountSignals(fieldSignals);
export const { jsonTextSignal, jsonValueSignal, isEmptyJsonSignal } =
	createJsonSignals(localStorage, `${prefix}.v1-pay.json`);
export const configObjectSignal = createConfigObjectSignal({
	fields,
	fieldSignals,
	jsonValueSignal,
});
