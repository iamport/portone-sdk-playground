import * as React from "react";
import {
  codePreviewSignal,
  fields,
  fieldSignals,
  jsonTextSignal,
  jsonValueSignal,
  reset,
  userCodeSignal,
} from "../../state/v1-pay";
import Control, { RequiredIndicator } from "../../ui/Control";
import HtmlEditor from "../../ui/HtmlEditor";
import JsonEditor from "../../ui/JsonEditor";
import FieldControl from "../field/FieldControl";
import { ForQa } from "./v1";

const View: React.FC = () => {
  const parseJsonFailed = jsonValueSignal.value == null;
  return (
    <>
      <p className="mb-4 text-xs text-slate-500">
        PG가 콘솔에서 테스트로 설정된 경우, 승인된 결제 건은 매일
        자정(23:00~23:50분 사이)에 자동으로 취소됩니다.<br />
        "<RequiredIndicator />" 표시는 필수입력 항목을 의미합니다. 상황에 따라서
        필수입력 표시가 아니어도 입력이 필요할 수 있습니다.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2 md:pb-80">
          <details>
            <summary
              className={`text-xs ${
                parseJsonFailed ? "text-red-700" : "text-slate-500"
              } cursor-pointer`}
            >
              추가 파라미터 (JSON{parseJsonFailed && " 파싱 실패"})
            </summary>
            <JsonEditor
              value={jsonTextSignal.value}
              onChange={(json) => jsonTextSignal.value = json}
            />
            <details className="open:py-2 opacity-0 hover:opacity-100 open:opacity-100 transition-all delay-100">
              <summary className="text-xs text-slate-500 cursor-pointer">
                포트원 내부 QA 전용 설정
              </summary>
              <ForQa />
            </details>
          </details>
          <Reset resetFn={reset} />
          <Control
            required
            label="가맹점 식별코드"
            code="userCode"
          >
            <input
              className="border"
              type="text"
              placeholder="imp00000000"
              value={userCodeSignal.value}
              onInput={(e) => userCodeSignal.value = e.currentTarget.value}
            />
          </Control>
          {Object.entries(fields).map(([key, field]) => (
            <FieldControl
              key={key}
              code={key}
              field={field}
              fieldSignal={fieldSignals[key]}
            />
          ))}
        </div>
        <div>
          <div
            className="md:sticky top-4 flex flex-col"
            style={{ height: "calc(100vh - 2rem)" }}
          >
            <h2 className="text-xs text-slate-500">연동 코드 예시</h2>
            <div className="flex-1">
              <HtmlEditor
                className="h-full"
                readOnly
                value={codePreviewSignal.value}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default View;

interface ResetProps {
  resetFn: () => void;
}
const Reset: React.FC<ResetProps> = ({ resetFn }) => {
  const [checkPhase, setCheckPhase] = React.useState(false);
  const gotoCheckPhase = () => setCheckPhase(true);
  const gotoInitialPhase = () => setCheckPhase(false);
  const doReset = () => (resetFn(), gotoInitialPhase());
  return (
    <div className="flex gap-2 text-sm">
      {checkPhase
        ? (
          <>
            <span className="text-red-600">입력된 내용을 전부 지울까요?</span>
            <button onClick={doReset}>✅</button>
            <button onClick={gotoInitialPhase}>❌</button>
          </>
        )
        : (
          <button
            className="px-2 rounded font-bold text-red-100 bg-red-600"
            onClick={gotoCheckPhase}
          >
            초기화
          </button>
        )}
    </div>
  );
};
