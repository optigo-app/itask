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
          <div className='WdthMost higtCmon CmonCentrEvry BrderRigt'>Task Name: <span className='valueBind taskname'>{selectedData?.selectedData && selectedData?.selectedData?.taskname}</span></div>
          <div className='WdthMIN higtCmon CmonCentrEvry'>Task No: <span className='valueBind'>{selectedData?.selectedData && selectedData?.selectedData?.taskno}</span></div>
        </div>

        <div className='CmonCentrEvry CmonFntSize BrderBtom'>
          <div className='WdthMost TxtDark higtCmon CmonCentrEvry BrderRigt'>Team <span className='valueBind'>{getAssigneeNames(selectedData?.selectedData?.assignee)}</span></div>
          <div className='WdthMIN higtCmon CmonCentrEvry'>Help File:</div>
        </div>

        <div className='CmonCentrEvry CmonFntSize BrderBtom'>
          <div className='WdMost higtCmon BrderRigt CmonCentrEvry'>Date: <span className='valueBind'>{selectedData?.selectedData && formatDate3(selectedData?.selectedData?.DeadLineDate)}</span></div>
          <div className='WdAvg BrderRigt higtCmon CmonCentrEvry'>Version:</div>
          <div className='WdMIN higtCmon CmonCentrEvry'>Upload Dt:</div>
        </div>

        <div className='CmonCentrEvry CmonFntSize BrderBtom'>
          <div className='WdMost higtCmon BrderRigt CmonCentrEvry'>Stack Holder</div>
          <div className='WdAvg higtCmon BrderRigt CmonCentrEvry'>Priority: <span className='valueBind'>{selectedData?.selectedData && selectedData?.selectedData?.priority}</span></div>
          <div className='WdMIN higtCmon CmonCentrEvry'>Feedback Dt:</div>
        </div>

        <div className='CmonCentrEvry CmonFntSize BrderBtom'>
          <div className='WdMost higtCmon BrderRigt CmonCentrEvry'>Deadline:</div>
          <div className='WdAvg BrderRigt higtCmon CmonCentrEvry'>Release:</div>
          <div className='WdMIN higtCmon CmonCentrEvry'>Lead By:</div>
        </div>

        <div className='CmonCentrEvry CmonFntSize'>
          <div className='WdMost higtCmon BrderRigt CmonCentrEvry'>
            <div>Tag</div>
            <input type="checkbox" className='checkbox' />
            <div>Print</div>
            <input type="checkbox" className='checkbox' />
            <div>Excel</div>
            <input type="checkbox" className='checkbox' />
            <div>Report</div>
            <input type="checkbox" className='checkbox' />
            <div>Dashboard</div>
            <input type="checkbox" className='checkbox' style={{ marginRight: "0px" }} />
          </div>
          <div className='WdAvg BrderRigt BrderBtom higtCmon CmonCentrEvry'>Sow By:</div>
          <div className='WdMIN higtCmon CmonCentrEvry BrderBtom'>Delivery By:</div>
        </div>

        <div className='CmonCentrEvry CmonFntSize BrderBtom'>
          <div className='WdMost higtCmon BrderRigt CmonCentrEvry'>
            <div>Add On</div>
            <input type="checkbox" className='checkbox' />
          </div>
          <div className='WdAvg BrderRigt higtCmon CmonCentrEvry'>Final Approval:</div>
          <div className='WdMIN higtCmon CmonCentrEvry'>Support Person:</div>
        </div>

        <div className='CmonCentrEvry CmonFntSize higtCmon BrderBtom'>
          <div className='TxtDark'>Technology</div>
          <input type="checkbox" className='checkbox SpacLft SpacRit' />
          <div className=''>.Net</div>
          <input type="checkbox" className='checkbox SpacLft SpacRit' />
          <div className=''>React</div>
          <input type="checkbox" className='checkbox SpacLft SpacRit' />
          <div className=''>Nextjs</div>
          <input type="checkbox" className='checkbox SpacLft SpacRit' />
          <div className=''>SQL</div>
        </div>  

        <div className='CmonCentrEvry CmonFntSize higtCmon BrderBtom'>Doc Brief:</div>
        <div>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className='higtCmon BrderBtom'></div>
          ))}
        </div>

        <div className='CmonCentrEvry CmonFntSize BrderBtom'>
          <div className='MostWd higtCmon BrderRigt'>Preview Points</div>
          <div className='AvgWd1 higtCmon BrderRigt' style={{ paddingLeft: "2px" }}>Person</div>
          <div className='TxtDark higtCmon' style={{ paddingLeft: "2px" }}>Remark:</div>
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
          <div className='MostWd higtCmon BrderRigt TxtDark CmonCentrEvry' style={{ textDecoration: "underline", textDecorationColor: "#000000" }}>SRD</div>
          <div className='AvgWd1 BrderRigt higtCmon CmonCentrEvry'>Checklist</div>
          <div className='AvgWd2 BrderRigt higtCmon CmonCentrEvry'>Checklist</div>
          <div className='MINWd higtCmon CmonCentrEvry TxtDark'>Remark:</div>
        </div>
        
        <div className='CmonCentrEvry CmonFntSize BrderBtom'>
          <div className='MostWd higtCmon BrderRigt CmonCentrEvry'>
            <div style={{ marginRight: "5px" }}>M1:</div> 
            <div style={{ textDecoration: "underline", textDecorationColor: "#000000", marginRight: "5px" }}>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </div> 
            <div style={{ marginRight: "5px" }}>Sign:</div> 
            <div style={{ textDecoration: "underline", textDecorationColor: "#000000", marginRight: "5px" }}>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </div> 
          </div>
          <div className='AvgWd1 BrderRigt higtCmon CmonCentrEvry'>
            <input type="checkbox" className='checkbox' style={{ marginRight: "4px" }} />
            <div>Purpose:</div>
          </div>
          <div className='AvgWd2 BrderRigt higtCmon CmonCentrEvry'>
            <input type="checkbox" className='checkbox' style={{ marginRight: "4px" }} />
            <div>WireFram/FlowChart</div>
          </div>
          <div className='MINWd higtCmon CmonCentrEvry TxtDark'></div>
        </div>
        
        <div className='CmonCentrEvry CmonFntSize BrderBtom'>
          <div className='MostWd higtCmon BrderRigt CmonCentrEvry'>
            <div style={{ marginRight: "5px" }}>M2:</div> 
            <div style={{ textDecoration: "underline", textDecorationColor: "#000000", marginRight: "5px" }}>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </div> 
            <div style={{ marginRight: "5px" }}>Sign:</div> 
            <div style={{ textDecoration: "underline", textDecorationColor: "#000000", marginRight: "5px" }}>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </div> 
          </div>
          <div className='AvgWd1 BrderRigt higtCmon CmonCentrEvry'>
            <input type="checkbox" className='checkbox' style={{ marginRight: "4px" }} />
            <div>Scope:</div>
          </div>
          <div className='AvgWd2 BrderRigt higtCmon CmonCentrEvry'>
            <input type="checkbox" className='checkbox' style={{ marginRight: "4px" }} />
            <div>UI Guidelines</div>
          </div>
          <div className='MINWd higtCmon CmonCentrEvry TxtDark'></div>
        </div>
        
        <div className='CmonCentrEvry CmonFntSize BrderBtom'>
          <div className='MostWd higtCmon BrderRigt CmonCentrEvry'>
            <div style={{ marginRight: "5px" }}>M3:</div> 
            <div style={{ textDecoration: "underline", textDecorationColor: "#000000", marginRight: "5px" }}>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </div> 
            <div style={{ marginRight: "5px" }}>Sign:</div> 
            <div style={{ textDecoration: "underline", textDecorationColor: "#000000", marginRight: "5px" }}>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </div> 
          </div>
          <div className='AvgWd1 BrderRigt higtCmon CmonCentrEvry'>
            <input type="checkbox" className='checkbox' style={{ marginRight: "4px" }} />
            <div>Fun. Require:</div>
          </div>
          <div className='AvgWd2 BrderRigt higtCmon CmonCentrEvry'>
            <input type="checkbox" className='checkbox' style={{ marginRight: "4px" }} />
            <div>3rd Party API</div>
          </div>
          <div className='MINWd higtCmon CmonCentrEvry TxtDark'></div>
        </div>
        
        <div className='CmonCentrEvry CmonFntSize BrderBtom'>
          <div className='MostWd higtCmon BrderRigt CmonCentrEvry'>
            <div style={{ marginRight: "5px" }}>M4:</div> 
            <div style={{ textDecoration: "underline", textDecorationColor: "#000000", marginRight: "5px" }}>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </div> 
            <div style={{ marginRight: "5px" }}>Sign:</div> 
            <div style={{ textDecoration: "underline", textDecorationColor: "#000000", marginRight: "5px" }}>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </div> 
          </div>
          <div className='AvgWd1 BrderRigt higtCmon CmonCentrEvry'>
            <input type="checkbox" className='checkbox' style={{ marginRight: "4px" }} />
            <div>Non Funct. Req.</div>
          </div>
          <div className='AvgWd2 BrderRigt higtCmon CmonCentrEvry'>
            <input type="checkbox" className='checkbox' style={{ marginRight: "4px" }} />
            <div>Client Approval</div>
          </div>
          <div className='MINWd higtCmon CmonCentrEvry TxtDark'></div>
        </div>

        <div className='CmonCentrEvry CmonFntSize higtCmon BrderBtom TxtDark' style={{ textDecoration: "underline", textDecorationColor: "#000000" }}>SRS-Estimate</div>

        <div className='CmonCentrEvry CmonFntSize'>
          <div className='MostWd higtCmon CmonCentrEvry'>
            <div className='w-50'>UI | Name :</div>
            <div className='w-50 CmonCentrEvry justify-content-end'>
              <div style={{ marginRight: "35px" }}>+</div>
              <div>Hrs:</div>
            </div>
          </div>
          <div className='AvgWd1 higtCmon CmonCentrEvry justify-content-center'>
            + Date
          </div>
          <div className='AvgWd2 BrderRigt higtCmon TxtDark CmonCentrEvry justify-content-center'>
            Start date:
          </div>
          <div className='MINWd higtCmon CmonCentrEvry TxtDark BrderBtom'>Remark:</div>
        </div>

        <div className='CmonCentrEvry CmonFntSize'>
          <div className='MostWd higtCmon CmonCentrEvry'>
            <div className='w-50'>API | Name :</div>
            <div className='w-50 CmonCentrEvry justify-content-end'>
              <div style={{ marginRight: "35px" }}>+</div>
              <div>Hrs:</div>
            </div>
          </div>
          <div className='AvgWd1 higtCmon CmonCentrEvry justify-content-center'>
            + Date
          </div>
          <div className='AvgWd2 BrderRigt higtCmon TxtDark CmonCentrEvry justify-content-center'>
            End date:
          </div>
          <div className='MINWd higtCmon CmonCentrEvry TxtDark BrderBtom'></div>
        </div>

        <div className='CmonCentrEvry CmonFntSize BrderBtom'>
          <div className='MostWd higtCmon CmonCentrEvry'>
            <div className='w-50'>DB | Name :</div>
            <div className='w-50 CmonCentrEvry justify-content-end'>
              <div style={{ marginRight: "35px" }}>+</div>
              <div>Hrs:</div>
            </div>
          </div>
          <div className='AvgWd1 higtCmon CmonCentrEvry justify-content-center'>
            + Date
          </div>
          <div className='AvgWd2 BrderRigt higtCmon TxtDark CmonCentrEvry justify-content-center'></div>
          <div className='MINWd higtCmon CmonCentrEvry TxtDark'></div>
        </div>

        <div className='CmonCentrEvry CmonFntSize'>
          <div className='MostWd higtCmon CmonCentrEvry TxtDark' style={{ textDecoration: "underline", textDecorationColor: "#000000" }}>Development</div>
          <div className='AvgWd1 higtCmon BrderRigt CmonCentrEvry'></div>
          <div className='AvgWd2 BrderRigt higtCmon CmonCentrEvry BrderBtom'>
            <input type="checkbox" className='checkbox' style={{ marginRight: "4px" }} />
            <div>Security Requirements</div>
          </div>
          <div className='MINWd higtCmon CmonCentrEvry TxtDark BrderBtom'>Remark:</div>
        </div>

        <div className='CmonCentrEvry CmonFntSize'>
          <div className='MostWd higtCmon CmonCentrEvry'>BODO By:</div>
          <div className='AvgWd1 higtCmon BrderRigt CmonCentrEvry'></div>
          <div className='AvgWd2 BrderRigt higtCmon CmonCentrEvry BrderBtom'>
            <input type="checkbox" className='checkbox' style={{ marginRight: "4px" }} />
            <div>Speed, Load Time</div>
          </div>
          <div className='MINWd higtCmon CmonCentrEvry BrderBtom'></div>
        </div>

        <div className='CmonCentrEvry CmonFntSize'>
          <div className='MostWd higtCmon CmonCentrEvry'>BODO Approval:</div>
          <div className='AvgWd1 higtCmon BrderRigt CmonCentrEvry'></div>
          <div className='AvgWd2 BrderRigt higtCmon CmonCentrEvry BrderBtom'>
            <input type="checkbox" className='checkbox' style={{ marginRight: "4px" }} />
            <div>Error Handling</div>
          </div>
          <div className='MINWd higtCmon CmonCentrEvry BrderBtom'></div>
        </div>

        <div className='CmonCentrEvry CmonFntSize'>
          <div className='MostWd higtCmon CmonCentrEvry'>Estimate:</div>
          <div className='AvgWd1 higtCmon BrderRigt CmonCentrEvry'></div>
          <div className='AvgWd2 BrderRigt higtCmon CmonCentrEvry'>
            <input type="checkbox" className='checkbox' style={{ marginRight: "4px" }} />
            <div>Guidelines On Branding</div>
          </div>
          <div className='MINWd higtCmon CmonCentrEvry BrderBtom'></div>
        </div>

        <div className='CmonCentrEvry CmonFntSize'>
          <div className='MostWd higtCmon CmonCentrEvry'>BODO Date:</div>
          <div className='AvgWd1 higtCmon BrderRigt CmonCentrEvry TxtDark'>Start Date:</div>
          <div className='AvgWd2 BrderRigt higtCmon BrderBtom' style={{ paddingLeft: "5px",}}>(Colors, Fonts, Logos)</div>
          <div className='MINWd higtCmon CmonCentrEvry BrderBtom'></div>
        </div>

        <div className='CmonCentrEvry CmonFntSize BrderBtom'>
          <div className='MostWd higtCmon CmonCentrEvry'>Assigned Date:</div>
          <div className='AvgWd1 higtCmon BrderRigt CmonCentrEvry TxtDark' style={{ paddingLeft: "7px" }}>End Date:</div>
          <div className='AvgWd2 BrderRigt higtCmon CmonCentrEvry'></div>
          <div className='MINWd higtCmon CmonCentrEvry'></div>
        </div>

        <div className='CmonCentrEvry CmonFntSize'>
          <div className='MostWd higtCmon CmonCentrEvry TxtDark' style={{ textDecoration: "underline", textDecorationColor: "#000000" }}>Testing</div>
          <div className='AvgWd1 higtCmon BrderRigt CmonCentrEvry'></div>
          <div className='AvgWd2 BrderRigt higtCmon BrderBtom CmonCentrEvry'>Is It Complete?</div>
          <div className='MINWd higtCmon CmonCentrEvry TxtDark BrderBtom'>Remarks:</div>
        </div>

        <div className='CmonCentrEvry CmonFntSize'>
          <div className='MostWd higtCmon CmonCentrEvry'>Test By:</div>
          <div className='AvgWd1 higtCmon BrderRigt CmonCentrEvry'></div>
          <div className='AvgWd2 BrderRigt higtCmon BrderBtom CmonCentrEvry'>Is It Clear?</div>
          <div className='MINWd higtCmon CmonCentrEvry BrderBtom'></div>
        </div>

        <div className='CmonCentrEvry CmonFntSize'>
          <div className='MostWd higtCmon CmonCentrEvry'>Prarior Dev. Approval:</div>
          <div className='AvgWd1 higtCmon BrderRigt CmonCentrEvry'></div>
          <div className='AvgWd2 BrderRigt higtCmon BrderBtom CmonCentrEvry'>Is It Consistent?</div>
          <div className='MINWd higtCmon CmonCentrEvry BrderBtom'></div>
        </div>

        <div className='CmonCentrEvry CmonFntSize'>
          <div className='MostWd higtCmon CmonCentrEvry'>Estimate:</div>
          <div className='AvgWd1 higtCmon BrderRigt CmonCentrEvry TxtDark'>Start Date:</div>
          <div className='AvgWd2 BrderRigt higtCmon BrderBtom CmonCentrEvry'>Is It Accurate?</div>
          <div className='MINWd higtCmon CmonCentrEvry BrderBtom'></div>
        </div>

        <div className='CmonCentrEvry CmonFntSize BrderBtom'>
          <div className='MostWd higtCmon CmonCentrEvry'>
            <div style={{ marginRight: "5px" }}>Local:</div> 
            <div style={{ textDecoration: "underline", textDecorationColor: "#000000", marginRight: "10px" }}>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </div> 
            <div style={{ marginRight: "5px" }}>Live:</div> 
            <div style={{ textDecoration: "underline", textDecorationColor: "#000000", marginRight: "5px" }}>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </div>
          </div>
          <div className='AvgWd1 higtCmon BrderRigt CmonCentrEvry TxtDark' style={{ paddingLeft: "7px" }}>End Date:</div>
          <div className='AvgWd2 BrderRigt higtCmon CmonCentrEvry'>Is It Relevant?</div>
          <div className='MINWd higtCmon CmonCentrEvry'></div>
        </div>

        {/* <div className='CmonCentrEvry CmonFntSize BrderBtom'>
          <div className='MostWd higtCmon CmonCentrEvry'></div>
          <div className='AvgWd1 higtCmon BrderRigt CmonCentrEvry TxtDark'></div>
          <div className='AvgWd2 BrderRigt higtCmon CmonCentrEvry'></div>
          <div className='MINWd higtCmon CmonCentrEvry'></div>
        </div> */}

        <div className='CmonCentrEvry CmonFntSize higtCmon BrderBtom TxtDark' style={{ textDecoration: "underline", textDecorationColor: "#000000" }}>Delivery Checklist</div>
        
        <div className='CmonCentrEvry CmonFntSize higtCmon'>
          <input type="checkbox" className='checkbox SpacRit' />
          <div className=''>Local</div>
          <input type="checkbox" className='checkbox SpacLft SpacRit' />
          <div className=''>Live</div>
          <input type="checkbox" className='checkbox SpacLft SpacRit' />
          <div className=''>Flag Based</div>
          <input type="checkbox" className='checkbox SpacLft SpacRit' />
          <div className=''>Security</div>
          <input type="checkbox" className='checkbox SpacLft SpacRit' />
          <div className=''>Session</div>
          <input type="checkbox" className='checkbox SpacLft SpacRit' />
          <div className=''>Clone</div>
          <input type="checkbox" className='checkbox SpacLft SpacRit' />
          <div className=''>Transaction Log</div>
          <input type="checkbox" className='checkbox SpacLft SpacRit' />
          <div className=''>User Log</div>
        </div>

        <div className='CmonCentrEvry CmonFntSize higtCmon BrderBtom'>
          <div className='SpacRitDPL'>Data Loading: Yes/No</div>
          <div className='SpacRitDPL'>Performance:</div>
          <div className='SpacRitDPL'>Data Cleanup Required?</div>
          <div className=''>Setting/Setup Document</div>
        </div>
        
        <div className='CmonCentrEvry CmonFntSize higtCmon'>Closing Statement By Stackholder:</div>

        <div className='CmonCentrEvry CmonFntSize higtCmon'></div>
      </div>
    </div>
  );
});

export default DocumentSheet;