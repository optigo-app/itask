import * as React from "react";

import './MomSheet.css'

const MomSheet = React.forwardRef((props, ref) => {
    console.log('ref----->>>>>>: ', ref);
    return (
        <div ref={ref} className='container_main'>

            <div className='discolumn'>
                <div className='container1'>
                    <div className='con1_header1' style={{ fontSize: '13px' }}>Project/Topic</div>
                    <div className='con1_header2'>Promise Date</div>
                </div>
                <div className='container1'>
                    <div className='con1_header1 sphei1' style={{ width: '45%', borderRight: '1px solid #bdbdbd' }}>Document#</div>
                    <div className='sphei1' style={{ width: '25%' }}></div>
                    <div className='con1_header2 sphei1' style={{ borderLeft: '1px solid #bdbdbd' }}>Start Date</div>
                </div>
                <div className='discolumn'>
                    <div className='con1_body'>Remarks</div>
                    <div className='con1_body'></div>
                    <div className='con1_body'></div>
                    <div className='con1_body' style={{ borderBottom: 'none' }}></div>
                </div>
                <div className='discolumn'>
                    <div className='con1_body2'>MOM</div>
                    <div className='con1_body3'>1</div>
                    <div className='con1_body3 sppad1'></div>
                    <div className='con1_body3'>2</div>
                    <div className='con1_body3 sppad1'></div>
                    <div className='con1_body3'>3</div>
                    <div className='con1_body3 sppad1'></div>
                    <div className='con1_body3'>4</div>
                    <div className='con1_body3 sppad1'></div>
                    <div className='con1_body3'>5</div>
                    <div className='con1_body3 sppad1'></div>
                    <div className='con1_body3'>6</div>
                    <div className='con1_body3 sppad1'></div>
                    <div className='con1_body3'>7</div>
                    <div className='con1_body3 sppad1'></div>
                    <div className='con1_body3'>8</div>
                    <div className='con1_body3 sppad1'></div>
                    <div className='con1_body3'>9</div>
                    <div className='con1_body3 sppad1'></div>
                    <div className='con1_body3'>10</div>
                    <div className='con1_body3 sppad1'></div>
                    <div className='con1_body3'>11</div>
                    <div className='con1_body3 sppad1'></div>
                    <div className='con1_body3'>12</div>
                    <div className='con1_body3 sppad1'></div>
                </div>
            </div>

            <div className='discolumn'>
                <div className='container2'>
                    <div className='con2_header1 sphei'>Meeting No</div>
                    <div className='sppad'>Date</div>
                </div>
                <div className='container2'>
                    <div className='con2_header1' style={{ width: '25.20%' }}>AGENDA</div>
                    <div className='con2_header2' style={{ width: '74.80%' }}>
                        <div className=''>Posted by</div>
                        <div className=''>Before</div>
                        <div className=''>Hrs</div>
                    </div>
                </div>
                <div className='con2_body'>
                    <div className='con2_subbody' style={{ paddingTop: '10px' }}>1</div>
                    <div className='con2_subbody'>2</div>
                    <div className='con2_subbody'>3</div>
                    <div className='con2_subbody'>4</div>
                    <div className='con2_subbody'>5</div>
                    <div className='con2_subbody'>6</div>
                    <div className='con2_subbody'>7</div>
                    <div className='con2_subbody'>8</div>
                    <div className='con2_subbody'>9</div>
                    <div style={{ paddingBottom: '10px', paddingLeft: '10px' }}>10</div>
                </div>
                <div className='con2_body2'>
                    <div>Participants</div>
                </div>
                <div className='con2_body'>
                    <div className='con2_subbody' style={{ paddingTop: '8px' }}>1</div>
                    <div className='con2_subbody'>2</div>
                    <div className='con2_subbody'>3</div>
                    <div className='con2_subbody'>4</div>
                    <div className='con2_subbody'>5</div>
                    <div style={{ paddingBottom: '7px', paddingLeft: '10px' }}>6</div>
                </div>
                <div className='con2_body3'># Meetings</div>
                <div className='con2_body4'>
                    <div style={{ display: 'flex' }}>
                        <div className='con2_subbody4' style={{ width: '18%', borderRight: '1px solid #bdbdbd' }}>Sr#</div>
                        <div className='con2_subbody4' style={{ width: '25%', borderRight: '1px solid #bdbdbd' }}>Date</div>
                        <div className='con2_subbody4' style={{ width: '58%' }}>Total Time</div>
                    </div>
                </div>
                <div className='con2_body4'>
                    <div style={{ display: 'flex' }}>
                        <div className='con2_subbody4' style={{ width: '18%', borderRight: '1px solid #bdbdbd' }}></div>
                        <div className='con2_subbody4' style={{ width: '25%', borderRight: '1px solid #bdbdbd' }}></div>
                        <div className='con2_subbody4' style={{ width: '58%' }}></div>
                    </div>
                </div>
                <div className='con2_body4'>
                    <div style={{ display: 'flex' }}>
                        <div className='con2_subbody4' style={{ width: '18%', borderRight: '1px solid #bdbdbd' }}></div>
                        <div className='con2_subbody4' style={{ width: '25%', borderRight: '1px solid #bdbdbd' }}></div>
                        <div className='con2_subbody4' style={{ width: '58%' }}></div>
                    </div>
                </div>
                <div className='con2_body4'>
                    <div style={{ display: 'flex' }}>
                        <div className='con2_subbody4' style={{ width: '18%', borderRight: '1px solid #bdbdbd' }}></div>
                        <div className='con2_subbody4' style={{ width: '25%', borderRight: '1px solid #bdbdbd' }}></div>
                        <div className='con2_subbody4' style={{ width: '58%' }}></div>
                    </div>
                </div>
                <div className='con2_body4'>
                    <div style={{ display: 'flex' }}>
                        <div className='con2_subbody4' style={{ width: '18%', borderRight: '1px solid #bdbdbd' }}></div>
                        <div className='con2_subbody4' style={{ width: '25%', borderRight: '1px solid #bdbdbd' }}></div>
                        <div className='con2_subbody4' style={{ width: '58%' }}></div>
                    </div>
                </div>
                <div className='con2_body4'>
                    <div style={{ display: 'flex' }}>
                        <div className='con2_subbody4' style={{ width: '18%', borderRight: '1px solid #bdbdbd' }}></div>
                        <div className='con2_subbody4' style={{ width: '25%', borderRight: '1px solid #bdbdbd' }}></div>
                        <div className='con2_subbody4' style={{ width: '58%' }}></div>
                    </div>
                </div>
                <div className='con2_body4'>
                    <div style={{ display: 'flex' }}>
                        <div className='con2_subbody4' style={{ width: '18%', borderRight: '1px solid #bdbdbd' }}></div>
                        <div className='con2_subbody4' style={{ width: '25%', borderRight: '1px solid #bdbdbd' }}></div>
                        <div className='con2_subbody4' style={{ width: '58%' }}></div>
                    </div>
                </div>
                <div className='con2_body4'>
                    <div style={{ display: 'flex' }}>
                        <div className='con2_subbody4' style={{ width: '18%', borderRight: '1px solid #bdbdbd' }}></div>
                        <div className='con2_subbody4' style={{ width: '25%', borderRight: '1px solid #bdbdbd' }}></div>
                        <div className='con2_subbody4' style={{ width: '58%' }}></div>
                    </div>
                </div>
                <div className='con2_body4'>
                    <div style={{ display: 'flex' }}>
                        <div className='con2_subbody4' style={{ width: '18%', borderRight: '1px solid #bdbdbd' }}></div>
                        <div className='con2_subbody4' style={{ width: '25%', borderRight: '1px solid #bdbdbd' }}></div>
                        <div className='con2_subbody4' style={{ width: '58%' }}></div>
                    </div>
                </div>
                <div className='con2_body4'>
                    <div style={{ display: 'flex' }}>
                        <div className='con2_subbody4' style={{ width: '18%', borderRight: '1px solid #bdbdbd' }}></div>
                        <div className='con2_subbody4' style={{ width: '25%', borderRight: '1px solid #bdbdbd' }}></div>
                        <div className='con2_subbody4' style={{ width: '58%' }}></div>
                    </div>
                </div>
                <div className='con2_body4'>
                    <div className='con2_subbody4'></div>
                </div>
                <div className='con2_body3'><b>on Due</b> [ Topics | Cases | Points ]</div>
                <div className='con2_body4'>
                    <div className='con2_subbody4'>1</div>
                </div>
                <div className='con2_body4'>
                    <div className='con2_subbody4'></div>
                </div>
                <div className='con2_body4'>
                    <div className='con2_subbody4'>2</div>
                </div>
                <div className='con2_body4'>
                    <div className='con2_subbody4'></div>
                </div>
                <div className='con2_body4'>
                    <div className='con2_subbody4'>3</div>
                </div>
                <div className='con2_body4'>
                    <div className='con2_subbody4'></div>
                </div>
                <div className='con2_body4'>
                    <div className='con2_subbody4'>4</div>
                </div>
                <div className='con2_body4'>
                    <div className='con2_subbody4'></div>
                </div>
                <div className='con2_body4'>
                    <div className='con2_subbody4'>5</div>
                </div>
                <div className='con2_body4'>
                    <div className='con2_subbody4'></div>
                </div>
                <div className='con2_body4'>
                    <div className='con2_subbody4'></div>
                </div>
            </div>
        </div>
    );
});
export default MomSheet;
