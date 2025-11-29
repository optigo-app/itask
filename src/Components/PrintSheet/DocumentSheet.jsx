import { forwardRef } from 'react';
import './DocumentSheet.scss';
import { formatDate3 } from '../../Utils/globalfun';

const DocumentSheet = forwardRef((selectedData, ref) => {
    const getAssigneeNames = (assignees) => {
        if (!assignees || !Array.isArray(assignees)) return '';
        return assignees
            .map(assignee => `${assignee.firstname} ${assignee.lastname}`.trim())
            .filter(name => name) 
            .join(', ');
    };

  return (
    <div ref={ref} className="dContainer_main">
      <div className='TxtCentr TxtDark' style={{ fontSize: "20px" }}>Document Sheet</div>

      <div className='BrderEvry'>
        <div className='CmonCentrEvry TxtDark BrderBtom CmonFntSize'>
          <div className='WdthMost higtT CmonCentrEvry BrderRigt'><span className='label-bold'></span> <span className='valueBind taskname label-bold'>{selectedData?.selectedData && selectedData?.selectedData?.taskname}</span></div>
          <div className='WdthMIN higtT CmonCentrEvry'><span className='label-bold'>Task No:</span> <span className='valueBind taskno label-bold'>{selectedData?.selectedData && selectedData?.selectedData?.taskno}</span></div>
        </div>

        <div className='CmonCentrEvry CmonFntSize BrderBtom'>
          <div className='WdthMost higtCmon CmonCentrEvry BrderRigt'><span className='label-bold'>Team:</span> <span className='valueBind label-bold'>{getAssigneeNames(selectedData?.selectedData?.assignee)}</span></div>
          <div className='WdthMIN higtCmon CmonCentrEvry text-light'>Help File:</div>
        </div>

        <div className='CmonCentrEvry CmonFntSize BrderBtom'>
          <div className='WdMost higtCmon BrderRigt CmonCentrEvry text-light'>Date: <span className='valueBind label-bold'>{selectedData?.selectedData && formatDate3(selectedData?.selectedData?.StartDate)}</span></div>
          <div className='WdAvg BrderRigt higtCmon CmonCentrEvry text-light'>Version:</div>
          <div className='WdMIN higtCmon CmonCentrEvry text-light'>Upload Dt:</div>
        </div>

        <div className='CmonCentrEvry CmonFntSize BrderBtom'>
          <div className='WdMost higtCmon BrderRigt CmonCentrEvry text-light'>Stack Holder</div>
          <div className='WdAvg higtCmon BrderRigt CmonCentrEvry text-light'>Priority: <span className='valueBind label-bold'>{selectedData?.selectedData && selectedData?.selectedData?.priority}</span></div>
          <div className='WdMIN higtCmon CmonCentrEvry text-light'>Feedback Dt:</div>
        </div>

        <div className='CmonCentrEvry CmonFntSize BrderBtom'>
          <div className='WdMost higtCmon BrderRigt CmonCentrEvry text-light'>Deadline: <span className='valueBind label-bold'>{selectedData?.selectedData && formatDate3(selectedData?.selectedData?.DeadLineDate)}</span></div>
          <div className='WdAvg BrderRigt higtCmon CmonCentrEvry text-light'>Release:</div>
          <div className='WdMIN higtCmon CmonCentrEvry text-light'>Lead By:</div>
        </div>

        <div className='CmonCentrEvry CmonFntSize'>
          <div className='WdMost higtCmon BrderRigt CmonCentrEvry'>
            <div className='text-light'>Tag</div>
            <input type="checkbox" className='checkbox' />
            <div className='text-light'>Print</div>
            <input type="checkbox" className='checkbox' />
            <div className='text-light'>Excel</div>
            <input type="checkbox" className='checkbox' />
            <div className='text-light'>Report</div>
            <input type="checkbox" className='checkbox' />
            <div className='text-light'>Dashboard</div>
            <input type="checkbox" className='checkbox' style={{ marginRight: "0px" }} />
          </div>
          <div className='WdAvg BrderRigt BrderBtom higtCmon CmonCentrEvry text-light'>Sow By:</div>
          <div className='WdMIN higtCmon CmonCentrEvry BrderBtom text-light'>Delivery By:</div>
        </div>

        <div className='CmonCentrEvry CmonFntSize BrderBtom'>
          <div className='WdMost higtCmon BrderRigt CmonCentrEvry'>
            <div className='text-light'>Add On</div>
            <input type="checkbox" className='checkbox' />
          </div>
          <div className='WdAvg BrderRigt higtCmon CmonCentrEvry text-light'>Final Approval:</div>
          <div className='WdMIN higtCmon CmonCentrEvry text-light'>Support Person:</div>
        </div>

        <div className='CmonCentrEvry CmonFntSize higtCmon BrderBtom'>
          <div className='label-bold'>Technology</div>
          <input type="checkbox" className='checkbox SpacLft SpacRit' />
          <div className='text-light'>.Net</div>
          <input type="checkbox" className='checkbox SpacLft SpacRit' />
          <div className='text-light'>React</div>
          <input type="checkbox" className='checkbox SpacLft SpacRit' />
          <div className='text-light'>Nextjs</div>
          <input type="checkbox" className='checkbox SpacLft SpacRit' />
          <div className='text-light'>SQL</div>
        </div>  

        <div className='CmonCentrEvry CmonFntSize higtCmon BrderBtom text-light'>Doc Brief:</div>
        <div>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className='higtCmon BrderBtom'></div>
          ))}
        </div>

        <div className='CmonCentrEvry CmonFntSize BrderBtom'>
          <div className='MostWd higtCmon BrderRigt text-light'>Preview Points</div>
          <div className='AvgWd1 higtCmon BrderRigt text-light' style={{ paddingLeft: "2px" }}>Person</div>
          <div className='label-bold higtCmon' style={{ paddingLeft: "2px" }}>Remark:</div>
        </div>
        <div>
          {Array.from({ length: 4 }).map((_, index) => ( 
            <div className='CmonCentrEvry CmonFntSize BrderBtom'>
              <div className='MostWd higtCmon BrderRigt' />
              <div className='AvgWd1 higtCmon BrderRigt' />
              <div className='higtCmon' />
            </div>
          ))}
        </div>
        
        <div className='CmonCentrEvry CmonFntSize BrderBtom'>
          <div className='MostWd higtCmon BrderRigt label-bold CmonCentrEvry' style={{ textDecoration: "underline", textDecorationColor: "#bdbdbd" }}>SRD</div>
          <div className='AvgWd1 BrderRigt higtCmon CmonCentrEvry text-light'>Checklist</div>
          <div className='AvgWd2 BrderRigt higtCmon CmonCentrEvry text-light'>Checklist</div>
          <div className='MINWd higtCmon CmonCentrEvry label-bold'>Remark:</div>
        </div>
        
        <div className='CmonCentrEvry CmonFntSize BrderBtom'>
          <div className='MostWd higtCmon BrderRigt CmonCentrEvry'>
            <div className='text-light' style={{ marginRight: "5px" }}>M1:</div> 
            <div style={{ textDecoration: "underline", textDecorationColor: "#bdbdbd", marginRight: "5px" }}>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </div> 
            <div className='text-light' style={{ marginRight: "5px" }}>Sign:</div> 
            <div style={{ textDecoration: "underline", textDecorationColor: "#bdbdbd", marginRight: "5px" }}>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </div> 
          </div>
          <div className='AvgWd1 BrderRigt higtCmon CmonCentrEvry'>
            <input type="checkbox" className='checkbox' style={{ marginRight: "4px" }} />
            <div className='text-light'>Purpose:</div>
          </div>
          <div className='AvgWd2 BrderRigt higtCmon CmonCentrEvry'>
            <input type="checkbox" className='checkbox' style={{ marginRight: "4px" }} />
            <div className='text-light'>WireFram/FlowChart</div>
          </div>
          <div className='MINWd higtCmon CmonCentrEvry TxtDark'></div>
        </div>
        
        <div className='CmonCentrEvry CmonFntSize BrderBtom'>
          <div className='MostWd higtCmon BrderRigt CmonCentrEvry'>
            <div className='text-light' style={{ marginRight: "5px" }}>M2:</div> 
            <div style={{ textDecoration: "underline", textDecorationColor: "#bdbdbd", marginRight: "5px" }}>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </div> 
            <div className='text-light' style={{ marginRight: "5px" }}>Sign:</div> 
            <div style={{ textDecoration: "underline", textDecorationColor: "#bdbdbd", marginRight: "5px" }}>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </div> 
          </div>
          <div className='AvgWd1 BrderRigt higtCmon CmonCentrEvry'>
            <input type="checkbox" className='checkbox' style={{ marginRight: "4px" }} />
            <div className='text-light'>Scope:</div>
          </div>
          <div className='AvgWd2 BrderRigt higtCmon CmonCentrEvry'>
            <input type="checkbox" className='checkbox' style={{ marginRight: "4px" }} />
            <div className='text-light'>UI Guidelines</div>
          </div>
          <div className='MINWd higtCmon CmonCentrEvry TxtDark'></div>
        </div>
        
        <div className='CmonCentrEvry CmonFntSize BrderBtom'>
          <div className='MostWd higtCmon BrderRigt CmonCentrEvry'>
            <div className='text-light' style={{ marginRight: "5px" }}>M3:</div> 
            <div style={{ textDecoration: "underline", textDecorationColor: "#bdbdbd", marginRight: "5px" }}>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </div> 
            <div className='text-light' style={{ marginRight: "5px" }}>Sign:</div> 
            <div style={{ textDecoration: "underline", textDecorationColor: "#bdbdbd", marginRight: "5px" }}>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </div> 
          </div>
          <div className='AvgWd1 BrderRigt higtCmon CmonCentrEvry'>
            <input type="checkbox" className='checkbox' style={{ marginRight: "4px" }} />
            <div className='text-light'>Fun. Require:</div>
          </div>
          <div className='AvgWd2 BrderRigt higtCmon CmonCentrEvry'>
            <input type="checkbox" className='checkbox' style={{ marginRight: "4px" }} />
            <div className='text-light'>3rd Party API</div>
          </div>
          <div className='MINWd higtCmon CmonCentrEvry TxtDark'></div>
        </div>
        
        <div className='CmonCentrEvry CmonFntSize BrderBtom'>
          <div className='MostWd higtCmon BrderRigt CmonCentrEvry'>
            <div className='text-light' style={{ marginRight: "5px" }}>M4:</div> 
            <div style={{ textDecoration: "underline", textDecorationColor: "#bdbdbd", marginRight: "5px" }}>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </div> 
            <div className='text-light' style={{ marginRight: "5px" }}>Sign:</div> 
            <div style={{ textDecoration: "underline", textDecorationColor: "#bdbdbd", marginRight: "5px" }}>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </div> 
          </div>
          <div className='AvgWd1 BrderRigt higtCmon CmonCentrEvry'>
            <input type="checkbox" className='checkbox' style={{ marginRight: "4px" }} />
            <div className='text-light'>Non Funct. Req.</div>
          </div>
          <div className='AvgWd2 BrderRigt higtCmon CmonCentrEvry'>
            <input type="checkbox" className='checkbox' style={{ marginRight: "4px" }} />
            <div className='text-light'>Client Approval</div>
          </div>
          <div className='MINWd higtCmon CmonCentrEvry TxtDark'></div>
        </div>

        <div className='CmonCentrEvry CmonFntSize higtCmon BrderBtom label-bold' style={{ textDecoration: "underline", textDecorationColor: "#bdbdbd" }}>SRS-Estimate</div>

        <div className='CmonCentrEvry CmonFntSize'>
          <div className='MostWd higtCmon CmonCentrEvry'>
            <div className='w-50 text-light'>UI | Name :</div>
            <div className='w-50 CmonCentrEvry justify-content-end'>
              <div className='text-light' style={{ width: "35px" }}></div>
              <div className='text-light'>+Hrs:</div>
            </div>
          </div>
          <div className='AvgWd1 higtCmon CmonCentrEvry justify-content-center'>
            <span className='text-light'>+ Date</span>
          </div>
          <div className='AvgWd2 BrderRigt higtCmon label-bold CmonCentrEvry justify-content-center'>
            Start date:
          </div>
          <div className='MINWd higtCmon CmonCentrEvry label-bold BrderBtom'>Remark:</div>
        </div>

        <div className='CmonCentrEvry CmonFntSize'>
          <div className='MostWd higtCmon CmonCentrEvry'>
            <div className='w-50 text-light'>API | Name :</div>
            <div className='w-50 CmonCentrEvry justify-content-end'>
              <div className='text-light' style={{ width: "27px" }}></div>
              <div className='text-light'>+Hrs:</div>
            </div>
          </div>
          <div className='AvgWd1 higtCmon CmonCentrEvry justify-content-center'>
            <span className='text-light'>+ Date</span>
          </div>
          <div className='AvgWd2 BrderRigt higtCmon label-bold CmonCentrEvry justify-content-center'>
            End date:
          </div>
          <div className='MINWd higtCmon CmonCentrEvry TxtDark BrderBtom'></div>
        </div>

        <div className='CmonCentrEvry CmonFntSize BrderBtom'>
          <div className='MostWd higtCmon CmonCentrEvry'>
            <div className='w-50 text-light'>DB | Name :</div>
            <div className='w-50 CmonCentrEvry justify-content-end'>
              <div className='text-light' style={{ width: "31px" }}></div>
              <div className='text-light'>+Hrs:</div>
            </div>
          </div>
          <div className='AvgWd1 higtCmon CmonCentrEvry justify-content-center'>
            <span className='text-light'>+ Date</span>
          </div>
          <div className='AvgWd2 BrderRigt higtCmon TxtDark CmonCentrEvry justify-content-center'></div>
          <div className='MINWd higtCmon CmonCentrEvry TxtDark'></div>
        </div>

        <div className='CmonCentrEvry CmonFntSize'>
          <div className='MostWd higtCmon CmonCentrEvry label-bold' style={{ textDecoration: "underline", textDecorationColor: "#bdbdbd" }}>Development</div>
          <div className='AvgWd1 higtCmon BrderRigt CmonCentrEvry'></div>
          <div className='AvgWd2 BrderRigt higtCmon CmonCentrEvry BrderBtom'>
            <input type="checkbox" className='checkbox' style={{ marginRight: "4px" }} />
            <div className='text-light'>Security Requirements</div>
          </div>
          <div className='MINWd higtCmon CmonCentrEvry label-bold BrderBtom'>Remark:</div>
        </div>

        <div className='CmonCentrEvry CmonFntSize'>
           <div className='MostWd higtCmon CmonCentrEvry text-light'>BODO By:</div>
          <div className='AvgWd1 higtCmon BrderRigt CmonCentrEvry text-light'>Development By:</div>
          <div className='AvgWd2 BrderRigt higtCmon CmonCentrEvry BrderBtom'>
            <input type="checkbox" className='checkbox' style={{ marginRight: "4px" }} />
            <div className='text-light'>Speed, Load Time</div>
          </div>
          <div className='MINWd higtCmon CmonCentrEvry BrderBtom'></div>
        </div>

        <div className='CmonCentrEvry CmonFntSize'>
          <div className='MostWd higtCmon CmonCentrEvry text-light'>BODO Approval:</div>
          <div className='AvgWd1 higtCmon BrderRigt CmonCentrEvry'></div>
          <div className='AvgWd2 BrderRigt higtCmon CmonCentrEvry BrderBtom'>
            <input type="checkbox" className='checkbox' style={{ marginRight: "4px" }} />
            <div className='text-light'>Error Handling</div>
          </div>
          <div className='MINWd higtCmon CmonCentrEvry BrderBtom'></div>
        </div>

        <div className='CmonCentrEvry CmonFntSize'>
          <div className='MostWd higtCmon CmonCentrEvry'>Estimate:</div>
          <div className='AvgWd1 higtCmon BrderRigt CmonCentrEvry'></div>
          <div className='AvgWd2 BrderRigt higtCmon CmonCentrEvry'>
            <input type="checkbox" className='checkbox' style={{ marginRight: "4px" }} />
            <div className='text-light'>Guidelines On Branding</div>
          </div>
          <div className='MINWd higtCmon CmonCentrEvry BrderBtom'></div>
        </div>

        <div className='CmonCentrEvry CmonFntSize'>
          <div className='MostWd higtCmon CmonCentrEvry text-light'>BODO Date:</div>
          <div className='AvgWd1 higtCmon BrderRigt CmonCentrEvry label-bold'>Start Date:</div>
          <div className='AvgWd2 BrderRigt higtCmon BrderBtom text-light' style={{ paddingLeft: "5px",}}>(Colors, Fonts, Logos)</div>
          <div className='MINWd higtCmon CmonCentrEvry BrderBtom'></div>
        </div>

        <div className='CmonCentrEvry CmonFntSize BrderBtom'>
          <div className='MostWd higtCmon CmonCentrEvry text-light'>Assigned Date:</div>
          <div className='AvgWd1 higtCmon BrderRigt CmonCentrEvry label-bold' style={{ paddingLeft: "7px" }}>End Date:</div>
          <div className='AvgWd2 BrderRigt higtCmon CmonCentrEvry'></div>
          <div className='MINWd higtCmon CmonCentrEvry'></div>
        </div>

        <div className='CmonCentrEvry CmonFntSize'>
          <div className='MostWd higtCmon CmonCentrEvry label-bold' style={{ textDecoration: "underline", textDecorationColor: "#bdbdbd" }}>Testing</div>
          <div className='AvgWd1 higtCmon BrderRigt CmonCentrEvry'></div>
          <div className='AvgWd2 BrderRigt higtCmon BrderBtom CmonCentrEvry text-light'>Is It Complete?</div>
          <div className='MINWd higtCmon CmonCentrEvry label-bold BrderBtom'>Remarks:</div>
        </div>

        <div className='CmonCentrEvry CmonFntSize'>
          <div className='MostWd higtCmon CmonCentrEvry text-light'>Test By:</div>
          <div className='AvgWd1 higtCmon BrderRigt CmonCentrEvry'></div>
          <div className='AvgWd2 BrderRigt higtCmon BrderBtom CmonCentrEvry text-light'>Is It Clear?</div>
          <div className='MINWd higtCmon CmonCentrEvry BrderBtom'></div>
        </div>

        <div className='CmonCentrEvry CmonFntSize'>
          <div className='MostWd higtCmon CmonCentrEvry text-light'>Prarior Dev. Approval:</div>
          <div className='AvgWd1 higtCmon BrderRigt CmonCentrEvry'></div>
          <div className='AvgWd2 BrderRigt higtCmon BrderBtom CmonCentrEvry text-light'>Is It Consistent?</div>
          <div className='MINWd higtCmon CmonCentrEvry BrderBtom'></div>
        </div>

        <div className='CmonCentrEvry CmonFntSize'>
          <div className='MostWd higtCmon CmonCentrEvry text-light'>Estimate:</div>
          <div className='AvgWd1 higtCmon BrderRigt CmonCentrEvry label-bold'>Start Date:</div>
          <div className='AvgWd2 BrderRigt higtCmon BrderBtom CmonCentrEvry text-light'>Is It Accurate?</div>
          <div className='MINWd higtCmon CmonCentrEvry BrderBtom'></div>
        </div>

        <div className='CmonCentrEvry CmonFntSize BrderBtom'>
          <div className='MostWd higtCmon CmonCentrEvry'>
            <div className='text-light' style={{ marginRight: "5px" }}>Local:</div> 
            <div style={{ textDecoration: "underline", textDecorationColor: "#bdbdbd", marginRight: "10px" }}>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </div> 
            <div className='text-light' style={{ marginRight: "5px" }}>Live:</div> 
            <div style={{ textDecoration: "underline", textDecorationColor: "#bdbdbd", marginRight: "5px" }}>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </div>
          </div>
          <div className='AvgWd1 higtCmon BrderRigt CmonCentrEvry label-bold' style={{ paddingLeft: "7px" }}>End Date:</div>
          <div className='AvgWd2 BrderRigt higtCmon CmonCentrEvry text-light'>Is It Relevant?</div>
          <div className='MINWd higtCmon CmonCentrEvry'></div>
        </div>
        <div className='CmonCentrEvry CmonFntSize higtCmon BrderBtom label-bold' style={{ textDecoration: "underline", textDecorationColor: "#bdbdbd" }}>Delivery Checklist</div>
        
        <div className='CmonCentrEvry CmonFntSize higtCmon'>
          <input type="checkbox" className='checkbox SpacRit text-light' />
          <div className='text-light'>Local</div>
          <input type="checkbox" className='checkbox SpacLft SpacRit text-light' />
          <div className='text-light'>Live</div>
          <input type="checkbox" className='checkbox SpacLft SpacRit text-light' />
          <div className='text-light'>Flag Based</div>
          <input type="checkbox" className='checkbox SpacLft SpacRit text-light' />
          <div className='text-light'>Security</div>
          <input type="checkbox" className='checkbox SpacLft SpacRit text-light' />
          <div className='text-light'>Session</div>
          <input type="checkbox" className='checkbox SpacLft SpacRit text-light' />
          <div className='text-light'>Clone</div>
          <input type="checkbox" className='checkbox SpacLft SpacRit text' />
          <div className='text-light'>Transaction Log</div>
          <input type="checkbox" className='checkbox SpacLft SpacRit text' />
          <div className='text-light'>User Log</div>
        </div>

        <div className='CmonCentrEvry CmonFntSize higtCmon BrderBtom'>
          <div className='SpacRitDPL text-light'>Data Loading: Yes/No</div>
          <div className='SpacRitDPL text-light'>Performance:</div>
          <div className='SpacRitDPL text-light'>Data Cleanup Required?</div>
          <div className='text-light'>Setting/Setup Document</div>
        </div>
        
        <div className='CmonCentrEvry CmonFntSize higtCmon text-light'>Closing Statement By Stackholder:</div>

        <div className='CmonCentrEvry CmonFntSize higtCmon'></div>
      </div>
    </div>
  );
});

export default DocumentSheet;