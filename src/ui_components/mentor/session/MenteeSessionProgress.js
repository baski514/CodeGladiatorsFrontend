import React, { useState, useEffect } from "react";
import { LoaderLarge } from "../../ui_utilities/Loaders";
import { connect } from "react-redux";
import Base from '../../Base'
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { IoArrowBackOutline } from "react-icons/io5";

const MenteeSessionProgress = ({match,history,auth}) => {
    const [showLoader, setShowLoader] = useState(false);
    const [showModule,setShowModule] = useState(true);

    const [response,setResponse] = useState([
        {
            Id:"a33hjhsdhsda",
            Name:"Web Development",
            thumbnailURL:"https://sitegalleria.com/wp-content/uploads/2019/08/Web-Development-Company-Bangalore.jpeg",
            sessions:[
                {
                    Id:"a33hjhsdhsdaqw",
                    Name:'Session 1',
                    status:"completed",
                    attachments:[
                        {
                            Id:"Edhdhaoojns",
                            Name:"MyAssesment",
                            feedback:[
                                {
                                    Id:"Edhdhaoojns",
                                    Name:"Hey you uploaded the wrong Assignment",
                                    time:"2015-7-12"
                                },
                                {
                                    Id:"Edhdhaoasojns",
                                    Name:"No sir that's correect",
                                    time:"2015-7-12"
                                }
                            ]
                        },
                        {
                            Id:"Edhdhaoojnass",
                            Name:"MyAssesment2",
                            feedback:[
                                {
                                    Id:"Edhdhaoojnsss",
                                    Name:"Again, it's not opening",
                                    time:"2015-9-23"
                                },
                                {
                                    Id:"Edhdhaoasojns",
                                    Name:"Yes my fault",
                                    time:"2015-10-12"
                                }
                            ]
                        }
                    ],
                },

                {
                    Id:"a33hjhsdasasshsdaqw",
                    Name:'Session 2',
                    status:"Pending",
                    attachments:[
                        {
                            Id:"Edhdhaoojnsdsxs",
                            Name:"MyAssesment121",
                            feedback:[
                                {
                                    Id:"Edhdhaooxzssadajns",
                                    Name:"That's correct",
                                    time:"2015-7-12"
                                },
                                {
                                    Id:"Edhdhaoasojnsdszs",
                                    Name:"No sir that's correect",
                                    time:"2015-7-12"
                                }
                            ]
                        },
                        {
                            Id:"Edhdhaoxxdcdaaasd",
                            Name:"MyAssesment213e1232",
                            feedback:[
                                {
                                    Id:"Edhdhasadzoojnsss",
                                    Name:"Again, it's not opening",
                                    time:"2015-9-12"
                                },
                                {
                                    Id:"Edhdhaoasojnsqwqs",
                                    Name:"Yes my fault",
                                    time:"2015-10-12"
                                }
                            ]
                        }
                    ],
                }
            ],
            open:true
        },

        {
            Id:"a33hjhsdhsda",
            Name:"Web Development",
            thumbnailURL:"https://sitegalleria.com/wp-content/uploads/2019/08/Web-Development-Company-Bangalore.jpeg",
            sessions:[
                {
                    Id:"a33hjhsdhsdaqw",
                    Name:'Session 1',
                    status:"completed",
                    attachments:[
                        {
                            Id:"Edhdhaoojns",
                            Name:"MyAssesment",
                            feedback:[
                                {
                                    Id:"Edhdhaoojns",
                                    Name:"Hey you uploaded the wrong Assignment",
                                    time:"2015-7-12"
                                },
                                {
                                    Id:"Edhdhaoasojns",
                                    Name:"No sir that's correect",
                                    time:"2015-7-12"
                                }
                            ]
                        },
                        {
                            Id:"Edhdhaoojnass",
                            Name:"MyAssesment2",
                            feedback:[
                                {
                                    Id:"Edhdhaoojnsss",
                                    Name:"Again, it's not opening",
                                    time:"2015-9-23"
                                },
                                {
                                    Id:"Edhdhaoasojns",
                                    Name:"Yes my fault",
                                    time:"2015-10-12"
                                }
                            ]
                        }
                    ],
                },

                {
                    Id:"a33hjhsdasasshsdaqw",
                    Name:'Session 2',
                    status:"Pending",
                    attachments:[
                        {
                            Id:"Edhdhaoojnsdsxs",
                            Name:"MyAssesment121",
                            feedback:[
                                {
                                    Id:"Edhdhaooxzssadajns",
                                    Name:"That's correct",
                                    time:"2015-7-12"
                                },
                                {
                                    Id:"Edhdhaoasojnsdszs",
                                    Name:"No sir that's correect",
                                    time:"2015-7-12"
                                }
                            ]
                        },
                        {
                            Id:"Edhdhaoxxdcdaaasd",
                            Name:"MyAssesment213e1232",
                            feedback:[
                                {
                                    Id:"Edhdhasadzoojnsss",
                                    Name:"Again, it's not opening",
                                    time:"2015-9-12"
                                },
                                {
                                    Id:"Edhdhaoasojnsqwqs",
                                    Name:"Yes my fault",
                                    time:"2015-10-12"
                                }
                            ]
                        }
                    ],
                }
            ],
            open:true
        },
        {
            Id:"a33hjhsdhsda",
            Name:"Web Development",
            thumbnailURL:"https://sitegalleria.com/wp-content/uploads/2019/08/Web-Development-Company-Bangalore.jpeg",
            sessions:[
                {
                    Id:"a33hjhsdhsdaqw",
                    Name:'Session 1',
                    status:"completed",
                    attachments:[
                        {
                            Id:"Edhdhaoojns",
                            Name:"MyAssesment",
                            feedback:[
                                {
                                    Id:"Edhdhaoojns",
                                    Name:"Hey you uploaded the wrong Assignment",
                                    time:"2015-7-12"
                                },
                                {
                                    Id:"Edhdhaoasojns",
                                    Name:"No sir that's correect",
                                    time:"2015-7-12"
                                }
                            ]
                        },
                        {
                            Id:"Edhdhaoojnass",
                            Name:"MyAssesment2",
                            feedback:[
                                {
                                    Id:"Edhdhaoojnsss",
                                    Name:"Again, it's not opening",
                                    time:"2015-9-23"
                                },
                                {
                                    Id:"Edhdhaoasojns",
                                    Name:"Yes my fault",
                                    time:"2015-10-12"
                                }
                            ]
                        }
                    ],
                },

                {
                    Id:"a33hjhsdasasshsdaqw",
                    Name:'Session 2',
                    status:"Pending",
                    attachments:[
                        {
                            Id:"Edhdhaoojnsdsxs",
                            Name:"MyAssesment121",
                            feedback:[
                                {
                                    Id:"Edhdhaooxzssadajns",
                                    Name:"That's correct",
                                    time:"2015-7-12"
                                },
                                {
                                    Id:"Edhdhaoasojnsdszs",
                                    Name:"No sir that's correect",
                                    time:"2015-7-12"
                                }
                            ]
                        },
                        {
                            Id:"Edhdhaoxxdcdaaasd",
                            Name:"MyAssesment213e1232",
                            feedback:[
                                {
                                    Id:"Edhdhasadzoojnsss",
                                    Name:"Again, it's not opening",
                                    time:"2015-9-12"
                                },
                                {
                                    Id:"Edhdhaoasojnsqwqs",
                                    Name:"Yes my fault",
                                    time:"2015-10-12"
                                }
                            ]
                        }
                    ],
                }
            ],
            open:true
        },
        {
            Id:"a33hjhsdhsda",
            Name:"Web Development",
            thumbnailURL:"https://sitegalleria.com/wp-content/uploads/2019/08/Web-Development-Company-Bangalore.jpeg",
            sessions:[
                {
                    Id:"a33hjhsdhsdaqw",
                    Name:'Session 1',
                    status:"completed",
                    attachments:[
                        {
                            Id:"Edhdhaoojns",
                            Name:"MyAssesment",
                            feedback:[
                                {
                                    Id:"Edhdhaoojns",
                                    Name:"Hey you uploaded the wrong Assignment",
                                    time:"2015-7-12"
                                },
                                {
                                    Id:"Edhdhaoasojns",
                                    Name:"No sir that's correect",
                                    time:"2015-7-12"
                                }
                            ]
                        },
                        {
                            Id:"Edhdhaoojnass",
                            Name:"MyAssesment2",
                            feedback:[
                                {
                                    Id:"Edhdhaoojnsss",
                                    Name:"Again, it's not opening",
                                    time:"2015-9-23"
                                },
                                {
                                    Id:"Edhdhaoasojns",
                                    Name:"Yes my fault",
                                    time:"2015-10-12"
                                }
                            ]
                        }
                    ],
                },

                {
                    Id:"a33hjhsdasasshsdaqw",
                    Name:'Session 2',
                    status:"Pending",
                    attachments:[
                        {
                            Id:"Edhdhaoojnsdsxs",
                            Name:"MyAssesment121",
                            feedback:[
                                {
                                    Id:"Edhdhaooxzssadajns",
                                    Name:"That's correct",
                                    time:"2015-7-12"
                                },
                                {
                                    Id:"Edhdhaoasojnsdszs",
                                    Name:"No sir that's correect",
                                    time:"2015-7-12"
                                }
                            ]
                        },
                        {
                            Id:"Edhdhaoxxdcdaaasd",
                            Name:"MyAssesment213e1232",
                            feedback:[
                                {
                                    Id:"Edhdhasadzoojnsss",
                                    Name:"Again, it's not opening",
                                    time:"2015-9-12"
                                },
                                {
                                    Id:"Edhdhaoasojnsqwqs",
                                    Name:"Yes my fault",
                                    time:"2015-10-12"
                                }
                            ]
                        }
                    ],
                }
            ],
            open:true
        },
        {
            Id:"a33hjhsdhsda",
            Name:"Web Development",
            thumbnailURL:"https://sitegalleria.com/wp-content/uploads/2019/08/Web-Development-Company-Bangalore.jpeg",
            sessions:[
                {
                    Id:"a33hjhsdhsdaqw",
                    Name:'Session 1',
                    status:"completed",
                    attachments:[
                        {
                            Id:"Edhdhaoojns",
                            Name:"MyAssesment",
                            feedback:[
                                {
                                    Id:"Edhdhaoojns",
                                    Name:"Hey you uploaded the wrong Assignment",
                                    time:"2015-7-12"
                                },
                                {
                                    Id:"Edhdhaoasojns",
                                    Name:"No sir that's correect",
                                    time:"2015-7-12"
                                }
                            ]
                        },
                        {
                            Id:"Edhdhaoojnass",
                            Name:"MyAssesment2",
                            feedback:[
                                {
                                    Id:"Edhdhaoojnsss",
                                    Name:"Again, it's not opening",
                                    time:"2015-9-23"
                                },
                                {
                                    Id:"Edhdhaoasojns",
                                    Name:"Yes my fault",
                                    time:"2015-10-12"
                                }
                            ]
                        }
                    ],
                },

                {
                    Id:"a33hjhsdasasshsdaqw",
                    Name:'Session 2',
                    status:"Pending",
                    attachments:[
                        {
                            Id:"Edhdhaoojnsdsxs",
                            Name:"MyAssesment121",
                            feedback:[
                                {
                                    Id:"Edhdhaooxzssadajns",
                                    Name:"That's correct",
                                    time:"2015-7-12"
                                },
                                {
                                    Id:"Edhdhaoasojnsdszs",
                                    Name:"No sir that's correect",
                                    time:"2015-7-12"
                                }
                            ]
                        },
                        {
                            Id:"Edhdhaoxxdcdaaasd",
                            Name:"MyAssesment213e1232",
                            feedback:[
                                {
                                    Id:"Edhdhasadzoojnsss",
                                    Name:"Again, it's not opening",
                                    time:"2015-9-12"
                                },
                                {
                                    Id:"Edhdhaoasojnsqwqs",
                                    Name:"Yes my fault",
                                    time:"2015-10-12"
                                }
                            ]
                        }
                    ],
                }
            ],
            open:true
        },
        {
            Id:"a33hjhsdhsda",
            Name:"Web Development",
            thumbnailURL:"https://sitegalleria.com/wp-content/uploads/2019/08/Web-Development-Company-Bangalore.jpeg",
            sessions:[
                {
                    Id:"a33hjhsdhsdaqw",
                    Name:'Session 1',
                    status:"completed",
                    attachments:[
                        {
                            Id:"Edhdhaoojns",
                            Name:"MyAssesment",
                            feedback:[
                                {
                                    Id:"Edhdhaoojns",
                                    Name:"Hey you uploaded the wrong Assignment",
                                    time:"2015-7-12"
                                },
                                {
                                    Id:"Edhdhaoasojns",
                                    Name:"No sir that's correect",
                                    time:"2015-7-12"
                                }
                            ]
                        },
                        {
                            Id:"Edhdhaoojnass",
                            Name:"MyAssesment2",
                            feedback:[
                                {
                                    Id:"Edhdhaoojnsss",
                                    Name:"Again, it's not opening",
                                    time:"2015-9-23"
                                },
                                {
                                    Id:"Edhdhaoasojns",
                                    Name:"Yes my fault",
                                    time:"2015-10-12"
                                }
                            ]
                        }
                    ],
                },

                {
                    Id:"a33hjhsdasasshsdaqw",
                    Name:'Session 2',
                    status:"Pending",
                    attachments:[
                        {
                            Id:"Edhdhaoojnsdsxs",
                            Name:"MyAssesment121",
                            feedback:[
                                {
                                    Id:"Edhdhaooxzssadajns",
                                    Name:"That's correct",
                                    time:"2015-7-12"
                                },
                                {
                                    Id:"Edhdhaoasojnsdszs",
                                    Name:"No sir that's correect",
                                    time:"2015-7-12"
                                }
                            ]
                        },
                        {
                            Id:"Edhdhaoxxdcdaaasd",
                            Name:"MyAssesment213e1232",
                            feedback:[
                                {
                                    Id:"Edhdhasadzoojnsss",
                                    Name:"Again, it's not opening",
                                    time:"2015-9-12"
                                },
                                {
                                    Id:"Edhdhaoasojnsqwqs",
                                    Name:"Yes my fault",
                                    time:"2015-10-12"
                                }
                            ]
                        }
                    ],
                }
            ],
            open:true
        },
        {
            Id:"a33hjhsdhsda",
            Name:"Web Development",
            thumbnailURL:"https://sitegalleria.com/wp-content/uploads/2019/08/Web-Development-Company-Bangalore.jpeg",
            sessions:[
                {
                    Id:"a33hjhsdhsdaqw",
                    Name:'Session 1',
                    status:"completed",
                    attachments:[
                        {
                            Id:"Edhdhaoojns",
                            Name:"MyAssesment",
                            feedback:[
                                {
                                    Id:"Edhdhaoojns",
                                    Name:"Hey you uploaded the wrong Assignment",
                                    time:"2015-7-12"
                                },
                                {
                                    Id:"Edhdhaoasojns",
                                    Name:"No sir that's correect",
                                    time:"2015-7-12"
                                }
                            ]
                        },
                        {
                            Id:"Edhdhaoojnass",
                            Name:"MyAssesment2",
                            feedback:[
                                {
                                    Id:"Edhdhaoojnsss",
                                    Name:"Again, it's not opening",
                                    time:"2015-9-23"
                                },
                                {
                                    Id:"Edhdhaoasojns",
                                    Name:"Yes my fault",
                                    time:"2015-10-12"
                                }
                            ]
                        }
                    ],
                },

                {
                    Id:"a33hjhsdasasshsdaqw",
                    Name:'Session 2',
                    status:"Pending",
                    attachments:[
                        {
                            Id:"Edhdhaoojnsdsxs",
                            Name:"MyAssesment121",
                            feedback:[
                                {
                                    Id:"Edhdhaooxzssadajns",
                                    Name:"That's correct",
                                    time:"2015-7-12"
                                },
                                {
                                    Id:"Edhdhaoasojnsdszs",
                                    Name:"No sir that's correect",
                                    time:"2015-7-12"
                                }
                            ]
                        },
                        {
                            Id:"Edhdhaoxxdcdaaasd",
                            Name:"MyAssesment213e1232",
                            feedback:[
                                {
                                    Id:"Edhdhasadzoojnsss",
                                    Name:"Again, it's not opening",
                                    time:"2015-9-12"
                                },
                                {
                                    Id:"Edhdhaoasojnsqwqs",
                                    Name:"Yes my fault",
                                    time:"2015-10-12"
                                }
                            ]
                        }
                    ],
                }
            ],
            open:true
        },
        {
            Id:"a33hjhsdhsda",
            Name:"Web Development",
            thumbnailURL:"https://sitegalleria.com/wp-content/uploads/2019/08/Web-Development-Company-Bangalore.jpeg",
            sessions:[
                {
                    Id:"a33hjhsdhsdaqw",
                    Name:'Session 1',
                    status:"completed",
                    attachments:[
                        {
                            Id:"Edhdhaoojns",
                            Name:"MyAssesment",
                            feedback:[
                                {
                                    Id:"Edhdhaoojns",
                                    Name:"Hey you uploaded the wrong Assignment",
                                    time:"2015-7-12"
                                },
                                {
                                    Id:"Edhdhaoasojns",
                                    Name:"No sir that's correect",
                                    time:"2015-7-12"
                                }
                            ]
                        },
                        {
                            Id:"Edhdhaoojnass",
                            Name:"MyAssesment2",
                            feedback:[
                                {
                                    Id:"Edhdhaoojnsss",
                                    Name:"Again, it's not opening",
                                    time:"2015-9-23"
                                },
                                {
                                    Id:"Edhdhaoasojns",
                                    Name:"Yes my fault",
                                    time:"2015-10-12"
                                }
                            ]
                        }
                    ],
                },

                {
                    Id:"a33hjhsdasasshsdaqw",
                    Name:'Session 2',
                    status:"Pending",
                    attachments:[
                        {
                            Id:"Edhdhaoojnsdsxs",
                            Name:"MyAssesment121",
                            feedback:[
                                {
                                    Id:"Edhdhaooxzssadajns",
                                    Name:"That's correct",
                                    time:"2015-7-12"
                                },
                                {
                                    Id:"Edhdhaoasojnsdszs",
                                    Name:"No sir that's correect",
                                    time:"2015-7-12"
                                }
                            ]
                        },
                        {
                            Id:"Edhdhaoxxdcdaaasd",
                            Name:"MyAssesment213e1232",
                            feedback:[
                                {
                                    Id:"Edhdhasadzoojnsss",
                                    Name:"Again, it's not opening",
                                    time:"2015-9-12"
                                },
                                {
                                    Id:"Edhdhaoasojnsqwqs",
                                    Name:"Yes my fault",
                                    time:"2015-10-12"
                                }
                            ]
                        }
                    ],
                }
            ],
            open:true
        },
        {
            Id:"a33hjhsdhsda",
            Name:"Web Development",
            thumbnailURL:"https://sitegalleria.com/wp-content/uploads/2019/08/Web-Development-Company-Bangalore.jpeg",
            sessions:[
                {
                    Id:"a33hjhsdhsdaqw",
                    Name:'Session 1',
                    status:"completed",
                    attachments:[
                        {
                            Id:"Edhdhaoojns",
                            Name:"MyAssesment",
                            feedback:[
                                {
                                    Id:"Edhdhaoojns",
                                    Name:"Hey you uploaded the wrong Assignment",
                                    time:"2015-7-12"
                                },
                                {
                                    Id:"Edhdhaoasojns",
                                    Name:"No sir that's correect",
                                    time:"2015-7-12"
                                }
                            ]
                        },
                        {
                            Id:"Edhdhaoojnass",
                            Name:"MyAssesment2",
                            feedback:[
                                {
                                    Id:"Edhdhaoojnsss",
                                    Name:"Again, it's not opening",
                                    time:"2015-9-23"
                                },
                                {
                                    Id:"Edhdhaoasojns",
                                    Name:"Yes my fault",
                                    time:"2015-10-12"
                                }
                            ]
                        }
                    ],
                },

                {
                    Id:"a33hjhsdasasshsdaqw",
                    Name:'Session 2',
                    status:"Pending",
                    attachments:[
                        {
                            Id:"Edhdhaoojnsdsxs",
                            Name:"MyAssesment121",
                            feedback:[
                                {
                                    Id:"Edhdhaooxzssadajns",
                                    Name:"That's correct",
                                    time:"2015-7-12"
                                },
                                {
                                    Id:"Edhdhaoasojnsdszs",
                                    Name:"No sir that's correect",
                                    time:"2015-7-12"
                                }
                            ]
                        },
                        {
                            Id:"Edhdhaoxxdcdaaasd",
                            Name:"MyAssesment213e1232",
                            feedback:[
                                {
                                    Id:"Edhdhasadzoojnsss",
                                    Name:"Again, it's not opening",
                                    time:"2015-9-12"
                                },
                                {
                                    Id:"Edhdhaoasojnsqwqs",
                                    Name:"Yes my fault",
                                    time:"2015-10-12"
                                }
                            ]
                        }
                    ],
                }
            ],
            open:true
        },
        {
            Id:"a33hjhsdhsda",
            Name:"Web Development",
            thumbnailURL:"https://sitegalleria.com/wp-content/uploads/2019/08/Web-Development-Company-Bangalore.jpeg",
            sessions:[
                {
                    Id:"a33hjhsdhsdaqw",
                    Name:'Session 1',
                    status:"completed",
                    attachments:[
                        {
                            Id:"Edhdhaoojns",
                            Name:"MyAssesment",
                            feedback:[
                                {
                                    Id:"Edhdhaoojns",
                                    Name:"Hey you uploaded the wrong Assignment",
                                    time:"2015-7-12"
                                },
                                {
                                    Id:"Edhdhaoasojns",
                                    Name:"No sir that's correect",
                                    time:"2015-7-12"
                                }
                            ]
                        },
                        {
                            Id:"Edhdhaoojnass",
                            Name:"MyAssesment2",
                            feedback:[
                                {
                                    Id:"Edhdhaoojnsss",
                                    Name:"Again, it's not opening",
                                    time:"2015-9-23"
                                },
                                {
                                    Id:"Edhdhaoasojns",
                                    Name:"Yes my fault",
                                    time:"2015-10-12"
                                }
                            ]
                        }
                    ],
                },

                {
                    Id:"a33hjhsdasasshsdaqw",
                    Name:'Session 2',
                    status:"Pending",
                    attachments:[
                        {
                            Id:"Edhdhaoojnsdsxs",
                            Name:"MyAssesment121",
                            feedback:[
                                {
                                    Id:"Edhdhaooxzssadajns",
                                    Name:"That's correct",
                                    time:"2015-7-12"
                                },
                                {
                                    Id:"Edhdhaoasojnsdszs",
                                    Name:"No sir that's correect",
                                    time:"2015-7-12"
                                }
                            ]
                        },
                        {
                            Id:"Edhdhaoxxdcdaaasd",
                            Name:"MyAssesment213e1232",
                            feedback:[
                                {
                                    Id:"Edhdhasadzoojnsss",
                                    Name:"Again, it's not opening",
                                    time:"2015-9-12"
                                },
                                {
                                    Id:"Edhdhaoasojnsqwqs",
                                    Name:"Yes my fault",
                                    time:"2015-10-12"
                                }
                            ]
                        }
                    ],
                }
            ],
            open:true
        },
        {
            Id:"a33hjhsdhsda",
            Name:"Web Development",
            thumbnailURL:"https://sitegalleria.com/wp-content/uploads/2019/08/Web-Development-Company-Bangalore.jpeg",
            sessions:[
                {
                    Id:"a33hjhsdhsdaqw",
                    Name:'Session 1',
                    status:"completed",
                    attachments:[
                        {
                            Id:"Edhdhaoojns",
                            Name:"MyAssesment",
                            feedback:[
                                {
                                    Id:"Edhdhaoojns",
                                    Name:"Hey you uploaded the wrong Assignment",
                                    time:"2015-7-12"
                                },
                                {
                                    Id:"Edhdhaoasojns",
                                    Name:"No sir that's correect",
                                    time:"2015-7-12"
                                }
                            ]
                        },
                        {
                            Id:"Edhdhaoojnass",
                            Name:"MyAssesment2",
                            feedback:[
                                {
                                    Id:"Edhdhaoojnsss",
                                    Name:"Again, it's not opening",
                                    time:"2015-9-23"
                                },
                                {
                                    Id:"Edhdhaoasojns",
                                    Name:"Yes my fault",
                                    time:"2015-10-12"
                                }
                            ]
                        }
                    ],
                },

                {
                    Id:"a33hjhsdasasshsdaqw",
                    Name:'Session 2',
                    status:"Pending",
                    attachments:[
                        {
                            Id:"Edhdhaoojnsdsxs",
                            Name:"MyAssesment121",
                            feedback:[
                                {
                                    Id:"Edhdhaooxzssadajns",
                                    Name:"That's correct",
                                    time:"2015-7-12"
                                },
                                {
                                    Id:"Edhdhaoasojnsdszs",
                                    Name:"No sir that's correect",
                                    time:"2015-7-12"
                                }
                            ]
                        },
                        {
                            Id:"Edhdhaoxxdcdaaasd",
                            Name:"MyAssesment213e1232",
                            feedback:[
                                {
                                    Id:"Edhdhasadzoojnsss",
                                    Name:"Again, it's not opening",
                                    time:"2015-9-12"
                                },
                                {
                                    Id:"Edhdhaoasojnsqwqs",
                                    Name:"Yes my fault",
                                    time:"2015-10-12"
                                }
                            ]
                        }
                    ],
                }
            ],
            open:true
        },
        {
            Id:"a33hjhsdzzzhsda",
            Name:"Blockchain",
            thumbnailURL:"https://static.bangkokpost.com/media/content/dcx/2020/01/29/3505734.jpg",
            sessions:[
                {
                    Id:"a33hjhsdazzzzhsdaqw",
                    Name:'Session 1',
                    status:"completed",
                    attachments:[
                        {
                            Id:"Edhdhaoojazxqqsns",
                            Name:"MyAssesment",
                            feedback:[
                                {
                                    Id:"Edhdhzasaoojns",
                                    Name:"Hey you uploaded the wrong Assignment",
                                    time:"2015-7-12"
                                },
                                {
                                    Id:"Edhdhaoasojnass",
                                    Name:"No sir that's correect",
                                    time:"2015-7-12"
                                }
                            ]
                        },
                        {
                            Id:"Edhdhaooqsjazswqqnass",
                            Name:"MyAssesment2",
                            feedback:[
                                {
                                    Id:"Edhqqwasdhaozzzxxojnsss",
                                    Name:"Again, it's not opening",
                                    time:"2015-9-23"
                                },
                                {
                                    Id:"Edhdhamkkmoxxxasojns",
                                    Name:"Yes my fault",
                                    time:"2015-10-12"
                                }
                            ]
                        }
                    ],
                },

                {
                    Id:"a33hjhsdasasshsxxxdaqw",
                    Name:'Session 2',
                    status:"Pending",
                    attachments:[
                        {
                            Id:"Edhdhaoojnsdsxxxs",
                            Name:"MyAssesment121",
                            feedback:[
                                {
                                    Id:"Edhdhaooxzssadxxajns",
                                    Name:"That's correct",
                                    time:"2015-7-12"
                                },
                                {
                                    Id:"Edhdhaoasojxxnsdszs",
                                    Name:"No sir that's correect",
                                    time:"2015-7-12"
                                }
                            ]
                        },
                        {
                            Id:"Edhdhxxaoxxdcdaaasd",
                            Name:"MyAssesment213e1232",
                            feedback:[
                                {
                                    Id:"Edhdhasadzoojnssxxs",
                                    Name:"Again, it's not opening",
                                    time:"2015-9-12"
                                },
                                {
                                    Id:"Edhdhaoasojnsqwxxqs",
                                    Name:"Yes my fault",
                                    time:"2015-10-12"
                                }
                            ]
                        }
                    ],
                }
            ],
            open:false
        }
    ]);

    const handleExpand = (i)=>{
        let copyModules = [...response]; 
        copyModules[i].open = !copyModules[i].open;
        setResponse(copyModules);
    }

    const sessionUi=()=>{
        return(
            <div className="w-full flex flex-col bg-white">
                <div className="flex flex-row w-full border-b-2 border-gray-400">
                    <div>

                    </div>
              
                </div>
            </div>
        )
    }

    const newMentorUi=(module)=>{
        console.log("Mentor ",module)
        return(
            <div class=" overflow-hidden py-3 px-2 m-1 transform hover:scale-110 motion-reduce:transform-none cursor-pointer">
            <div className="w-full h-20"></div>
            <div className="group bg-white hover:bg-blue-500 hover:shadow-lg rounded-lg cursor-pointer"  onClick={() => {
                                                                    //hide this and open session details
                                                                    setShowModule(false)
                                                                }}>
                
                <div class="flex justify-center -mt-10">
                    <img src={module.thumbnailURL?module.thumbnailURL:"https://cdn1.iconfinder.com/data/icons/avatar-97/32/avatar-18-512.png"} className="rounded-full border-solid border-white border-2 -mt-10 h-20 w-20" alt="profile"/>		
                </div>

                <div class="text-center px-3 pb-6 pt-2 cursor-pointer">
                    <h3 class="group-hover:text-white text-gray-900 text-lg font-bold">{module.Name}</h3>
                    <p class="mt-2 text-lg group-hover:text-white text-gray-700 bold h-3 font-bold">SOME</p>
                </div>
                
                <div class="flex justify-center pb-3">
                    {/* {mentor.Current_Role__c?
                          <>
                          <div className="w-full grid grid-cols-2">
                            <div class="text-center border-r text-base">
                                <h2 className="group-hover:text-white text-gray-900">{parseInt(mentor.Total_Experience__c/12)} yrs</h2>
                                <span className="group-hover:text-white text-gray-600">Expirence</span>
                            </div>
                            <div class="pr-3 flex items-center justify-center">
                                <h2 className="text-base group-hover:text-white text-gray-900 font-bold">{mentor.Current_Role__c}</h2>
                            </div>
                          </div>
                        </>:
                        <div class="w-full text-center text-base">
                          <h2 className="group-hover:text-white text-gray-900">{parseInt(mentor.Total_Experience__c/12)} yrs</h2>
                          <span className="group-hover:text-white text-gray-600">Expirence</span>
                        </div>   
                } */}
                </div>
            </div>
        </div>
        )
    }

    const moduleUi =()=>{
        return(
            <>
            <div className="container mx-auto max-full mt-5">
                <div className="md:grid md:grid-cols-4 flex flex-col">
                    {response && response.map((module, index) => {
                        return(newMentorUi(module))
                    })}
                </div>
            </div>
            </>
        );
        
    }

    return (
        <Base history={history} pathList={[{to:"/",name:"Home"},{to:"#",name:"Instructors"}]}>
        <div className="container mx-auto py-4 md:px-12">
            <center>
                <h3 className="text-xl">Student Session Response</h3>
            </center>
            {showLoader ? (
                <div className="flex items-center justify-center h-3/6">
                    <LoaderLarge type="ThreeDots" />
                </div>
            ) : (
                <>
                    {showModule?moduleUi():sessionUi()}
                </>
            )}
        </div>
    </Base>
    );
}

const mapStateToProps = (state) => {
    // console.log(state);
    return {
        auth: state.firebase.auth,
        profile: state.firebase.profile
    };
};

export default connect(mapStateToProps)(MenteeSessionProgress);