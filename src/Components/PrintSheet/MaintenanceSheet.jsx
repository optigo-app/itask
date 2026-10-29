import { forwardRef, useEffect, useLayoutEffect, useRef, useState } from 'react';
import './MaintenanceSheet.scss';
import { cleanDate, formatDate3 } from '../../Utils/globalfun';
import { taskDescGetApi } from '../../Api/TaskApi/TaskDescGetApi';

const MaintenanceSheet = forwardRef((selectedData, ref) => {
  const d = selectedData?.selectedData;
  const onReady = selectedData?.onReady;
  const [desc, setDesc] = useState('');
  const [descReady, setDescReady] = useState(false);
  const descRef = useRef(null);
  const notified = useRef(false);

  // Assignees filtered by designation — first name shown, "+N" for the rest
  const getRoleAssignee = (keywords) => {
    const list = Array.isArray(d?.assignee) ? d.assignee : [];
    const matched = list.filter((a) => {
      const desig = (a?.designation ?? '').toLowerCase();
      return keywords.some((k) => desig.includes(k));
    });
    if (!matched.length) return '';
    const first = `${matched[0]?.firstname ?? ''} ${matched[0]?.lastname ?? ''}`.trim();
    return matched.length > 1 ? `${first} +${matched.length - 1}` : first;
  };

  const supportName = getRoleAssignee(['support']);
  const testerName = getRoleAssignee(['tester']);
  const coderName = getRoleAssignee(['coder', 'dev']);

  // Normalize \r\n, drop empty lines so they don't leave blank rows in print
  const cleanDesc = (t) => (t ?? '')
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((l) => l.trimEnd())
    .filter((l) => l.trim() !== '')
    .join('\n');

  useEffect(() => {
    const fallback = cleanDesc(d?.descr ?? d?.description ?? '');
    setDesc(fallback);
    if (!d?.taskid) {
      setDescReady(true);
      return;
    }
    let active = true;
    // Safety: never hold the print forever if the API stalls
    const timer = setTimeout(() => { if (active) setDescReady(true); }, 4000);
    taskDescGetApi(d)
      .then((res) => {
        if (active) setDesc(cleanDesc(res?.rd?.[0]?.descr) || fallback);
      })
      .catch(() => {})
      .finally(() => {
        clearTimeout(timer);
        if (active) setDescReady(true);
      });
    return () => { active = false; clearTimeout(timer); };
  }, [d?.taskid]);

  // Truncate description to the 5-row block, appending "..." when it overflows
  useLayoutEffect(() => {
    const el = descRef.current;
    if (el) {
    el.textContent = desc;
    if (el.scrollHeight > el.clientHeight + 1) {
      let lo = 0, hi = desc.length;
      while (lo < hi) {
        const mid = Math.ceil((lo + hi) / 2);
        el.textContent = `${desc.slice(0, mid)}...`;
        if (el.scrollHeight <= el.clientHeight + 1) lo = mid; else hi = mid - 1;
      }
      el.textContent = `${desc.slice(0, lo)}...`;
    }
    }
    // Content is committed to the DOM — safe to hand off to the printer
    if (descReady && !notified.current) {
      notified.current = true;
      onReady?.();
    }
  }, [desc, descReady, onReady]);
  return (
    <div ref={ref} className="page_ms">

      {/* ── HEADER ── */}
      <div className="headerBox_ms">
        <div className="headerTitle_ms">
          MAINTENANCE SHEET
          <div className="headerTitleRight_ms">
            {String(d?.taskno ?? '').toLowerCase().includes('mm') ? <b className="maintNoVal_ms">{d?.taskno}</b> : null}
            <div
              className="priorityTag_ms"
              style={{ color: d?.priority ? 'black' : '#dbdbdb' }}
            >
              {d?.priority ? d?.priority : 'Priority'}
            </div>
          </div>
        </div>

        {/* Row 1: Topic | Ticket# | Critical | Today | Approval */}
        <div className="headerRow_ms">
          <div className="hTopic_ms noBorderBottom_ms">
            Topic:
            <p className="topicValue_ms ellipsis-2_ms">{d?.taskname}</p>
          </div>
          <div className="hTicket_ms noBorderTop_ms noBorderLeft_ms">Ticket#</div>
          <div className="hCritical_ms centerCell_ms">
            <input type="checkbox" className="checkbox_ms" /> Critical
          </div>
          <div className="hDay_ms noBorderBottom_ms" style={{ paddingTop: '4px' }}>
            <input type="checkbox" className="checkbox_ms" /> Today
          </div>
          <div className="hApproval_ms">Approval</div>
        </div>

        {/* Row 2: (topic cont) | (ticket cont) | Invoice# | Tomorrow | Approval by tester */}
        <div className="headerRow_ms">
          <div className="hTopic_ms noBorderBottom_ms noBorderTop_ms noBorderRight_ms"></div>
          <div className="hTicket_ms noBorderTop_ms noBorderBottom_ms noBorderLeft_ms"></div>
          <div className="hCritical_ms">Invoice#</div>
          <div className="hDay_ms noBorderBottom_ms">
            <input type="checkbox" className="checkbox_ms" /> Tomorrow
          </div>
          <div className="hApproval_ms">Approval by tester</div>
        </div>

        {/* Row 3: (topic cont) | (ticket cont) | Bag# | This Week | Date & Time In */}
        <div className="headerRow_ms">
          <div className="hTopic_ms noBorderTop_ms noBorderRight_ms"></div>
          <div className="hTicket_ms"></div>
          <div className="hCritical_ms">Bag#</div>
          <div className="hDay_ms noBorderTop_ms">
            <input type="checkbox" className="checkbox_ms" /> This Week
          </div>
          <div className="hApproval_ms">
            Date &amp; Time In
            <p className="topicValue_ms">
              {d?.StartDate && cleanDate(d.StartDate) ? formatDate3(cleanDate(d.StartDate)) : ''}
            </p>
          </div>
        </div>

        {/* INFO ROW: Client | Upload# | Monitoring | job# | Next | App
            job# aligns under Critical/Invoice#/Bag# column */}
        <div className="headerRow_ms">
          <div className="hTopic_ms noBorderRight_ms" style={{ display: 'flex' }}>
            <div className="infoClient_ms">Client:</div>
            <div className="infoUpload_ms">Upload#:</div>
          </div>
          <div className="hTicket_ms noBorderTop_ms noBorderLeft_ms" style={{ fontSize: '10px', alignItems: 'center', fontWeight: 700, display: 'flex', minHeight: '24px' }}>Monitoring:</div>
          <div className="hCritical_ms">job#</div>
          <div className="hDay_ms noBorderTop_ms" style={{ alignItems: 'flex-end', paddingBottom: '4px' }}>Next _____________</div>
          <div className="hApproval_ms">App</div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="bodyBox_ms">

        {/* Action/Steps header + first item */}
        <div className="bodyRow_ms">
          <div className="bAction_ms">Action/Steps:</div>
          <div className="bCol2_ms">Doc migration</div>
          <div className="bCol3_ms"><b>^ CR</b></div>
        </div>
        <div className="bodyRow_ms">
          <div className="bAction_ms"></div>
          <div className="bCol2_ms">Doc Upload</div>
          <div className="bCol3_ms"><b>^ Issue</b></div>
        </div>
        <div className="bodyRow_ms">
          <div className="bAction_ms"></div>
          <div className="bCol2_ms">Doc Limitation</div>
          <div className="bCol3_ms"><b>^ Bug</b></div>
        </div>
        <div className="bodyRow_ms">
          <div className="bAction_ms"></div>
          <div className="bCol2_ms">Doc Gape</div>
          <div className="bCol3_ms"><b>^ SP Error</b></div>
        </div>
        <div className="bodyRow_ms">
          <div className="bAction_ms"></div>
          <div className="bCol2_ms">Training Gape</div>
          <div className="bCol3_ms">Code Error</div>
        </div>
        <div className="bodyRow_ms">
          <div className="bAction_ms"></div>
          <div className="bCol2_ms">Flow not develop</div>
          <div className="bCol3_ms">Slowness</div>
        </div>
        <div className="bodyRow_ms">
          <div className="bAction_ms"></div>
          <div className="bCol2_ms">Central Upload</div>
          <div className="bCol3_ms">Patch Upload</div>
        </div>
        <div className="bodyRow_ms">
          <div className="bAction_ms"></div>
          <div className="bCol2_ms">Local Account</div>
          <div className="bCol3_ms">Store Setting</div>
        </div>

        {/* Checked Local + Tester Remark | Testing Account | Testing Gape */}
        <div className="bodyRow_ms">
          <div className="bAction_ms noBorderBottom_ms" style={{ display: 'flex' }}>
            <div className="subLeftLabel_ms noBorderBottom_ms">
              Checked Local&nbsp;
              <label>BQ</label> <input type="checkbox" className="checkbox_ms" disabled />&nbsp;
              <label>AQ</label> <input type="checkbox" className="checkbox_ms" disabled />
            </div>
            <div className="subLeftRemark_ms devRemarkBorder_ms">Tester Remark:</div>
          </div>
          <div className="bCol2_ms noBorderBottom_ms">Testing Account</div>
          <div className="bCol3_ms noBorderBottom_ms">Testing Gape</div>
        </div>

        {/* Test Account | Client's Account | Apply to all */}
        <div className="bodyRow_ms">
          <div className="bAction_ms noBorderBottom_ms" style={{ display: 'flex' }}>
            <div className="subLeftLabel_ms noBorderBottom_ms">
              Test Account&nbsp;&nbsp;
              <label>BQ</label> <input type="checkbox" className="checkbox_ms" disabled />&nbsp;
              <label>AQ</label> <input type="checkbox" className="checkbox_ms" disabled />
            </div>
            <div className="subLeftRemark_ms devRemarkBorder_ms"></div>
          </div>
          <div className="bCol2_ms noBorderBottom_ms">Client's Account</div>
          <div className="bCol3_ms noBorderBottom_ms">Apply to all</div>
        </div>

        {/* Client Account | All Client Account | Client support */}
        <div className="bodyRow_ms">
          <div className="bAction_ms" style={{ display: 'flex' }}>
            <div className="subLeftLabel_ms">
              Client Account&nbsp;
              <label>BQ</label> <input type="checkbox" className="checkbox_ms" disabled />&nbsp;
              <label>AQ</label> <input type="checkbox" className="checkbox_ms" disabled />
            </div>
            <div className="subLeftRemark_ms devRemarkBorder_ms noBorderBottom_ms"></div>
          </div>
          <div className="bCol2_ms noBorderBottom_ms">All Client Account</div>
          <div className="bCol3_ms noBorderBottom_ms">Client support</div>
        </div>

        {/* Repeat count + Dev Remark | Estimate By | Time */}
        <div className="bodyRow_ms">
          <div className="bAction_ms noBorderBottom_ms" style={{ display: 'flex' }}>
            <div className="subLeftLabel_ms noBorderBottom_ms">Repeat count:</div>
            <div className="subLeftRemark_ms devRemarkBorder_ms">Dev Remark:</div>
          </div>
          <div className="bCol2_ms noBorderRight_ms borderTop_ms"><b>Estimate By</b></div>
          <div className="bCol3_ms borderTop_ms"><b>Time</b></div>
        </div>

        {/* Affected jobs | Support | (empty) */}
        <div className="bodyRow_ms estRow_ms">
          <div className="bAction_ms noBorderBottom_ms noBorderTop_ms" style={{ display: 'flex' }}>
            <div className="subLeftLabel_ms">Affected jobs:</div>
            <div className="subLeftRemark_ms devRemarkBorder_ms"></div>
          </div>
          <div className="bCol2_ms noBorderBottom_ms noBorderTop_ms noBorderRight_ms">
            <div className="estRoleCell_ms">
              <span>Support:</span>
              <span className="estNameLine_ms">{supportName}</span>
            </div>
          </div>
          <div className="bCol3_ms noBorderBottom_ms noBorderTop_ms"></div>
        </div>

        {/* (empty left) | Tester | (empty) */}
        <div className="bodyRow_ms estRow_ms">
          <div className="bAction_ms noBorderBottom_ms noBorderTop_ms" style={{ display: 'flex' }}>
            <div className="subLeftLabel_ms"></div>
            <div className="subLeftRemark_ms devRemarkBorder_ms"></div>
          </div>
          <div className="bCol2_ms noBorderBottom_ms noBorderTop_ms noBorderRight_ms">
            <div className="estRoleCell_ms">
              <span>Tester:</span>
              <span className="estNameLine_ms">{testerName}</span>
            </div>
          </div>
          <div className="bCol3_ms noBorderBottom_ms noBorderTop_ms"></div>
        </div>

        {/* Forward To | Coder | (empty) */}
        <div className="bodyRow_ms estRow_ms">
          <div className="bAction_ms noBorderTop_ms" style={{ display: 'flex' }}>
            <div className="subLeftLabel_ms" style={{ fontWeight: 700 }}>Forward To</div>
            <div className="subLeftRemark_ms devRemarkBorder_ms noBorderBottom_ms"></div>
          </div>
          <div className="bCol2_ms noBorderTop_ms noBorderRight_ms">
            <div className="estRoleCell_ms">
              <span>Coder:</span>
              <span className="estNameLine_ms">{coderName}</span>
            </div>
          </div>
          <div className="bCol3_ms noBorderTop_ms"></div>
        </div>

        {/* Closing Remark | Root cause report | Paid */}
        <div className="closingRow_ms">
          <div className="closingRemark_ms noBorderBottom_ms">Closing Remark:</div>
          <div className="closingRoot_ms">Root cause report</div>
          <div className="closingPaidLabel_ms">Paid</div>
        </div>

        {/* Yes | No (under Paid) */}
        <div className="closingRow_ms">
          <div className="closingRemarkEmpty_ms"></div>
          <div className="closingRootEmpty_ms"></div>
          <div className="closingPaidYesNo_ms">
            <div className="paidYes_ms">Yes</div>
            <div className="paidNo_ms">No</div>
          </div>
        </div>

      </div>

      {/* ── TRACKING STEP ── */}
      <div className="trackingBox_ms">
        <div className="trackingRow_ms trackingLabelRow_ms">
          <div className="trackingLabel_ms">Tracking step</div>
          <div className="trackingSpace_ms"></div>
        </div>
        <div ref={descRef} className="trackingDescOverlay_ms">{desc}</div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="trackingRow_ms"></div>
        ))}
        {['Support', 'Tester', 'Coder'].map((role) => (
          <div key={role} className="assignBlock_ms">
            <div className="assignRow_ms">
              <div className="assignLabel_ms"><b>{role}</b></div>
              <div className="assignRemark_ms"><b>Remark</b></div>
            </div>
            {['Assign Date:', 'Start Date:', 'End Date:', 'Assign to _______________'].map((lbl) => (
              <div key={lbl} className="assignRow_ms">
                <div className="assignLabel_ms">{lbl}</div>
                <div className="assignRemark_ms"></div>
              </div>
            ))}
          </div>
        ))}
      </div>

    </div>
  );
});

export default MaintenanceSheet;
