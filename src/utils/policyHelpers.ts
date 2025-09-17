import { OrderSchema } from "../validations/orderValidations";
import prisma from "../config/db";
import { getCourier } from "../services/orderService2";
import axios from "axios";

// export function newPlanMapping(prod: string, plan: string): string {
//     let planId = "000";

//     if (prod.includes("Personal")) {
//         if (prod.includes("FBL")) {
//             if (plan.includes("Gold")) {
//                 planId = "064";
//             } else if (plan.includes("Silver")) {
//                 planId = "065";
//             } else if (plan.includes("Bronze")) {
//                 planId = "066";
//             }
//         } else if (prod.includes("MIB")) {
//             if (plan.includes("Gold")) {
//                 planId = "082";
//             } else if (plan.includes("Silver")) {
//                 planId = "083";
//             } else if (plan.includes("Bronze")) {
//                 planId = "084";
//             }
//         } else {
//             if (plan.includes("Gold")) {
//                 planId = "051";
//             } else if (plan.includes("Silver")) {
//                 planId = "052";
//             } else if (plan.includes("Bronze")) {
//                 planId = "053";
//             } else if (plan.includes("Diamond")) {
//                 planId = "091";
//             } else if (plan.includes("Platinum")) {
//                 planId = "092";
//             }
//         }
//     } else if (prod.includes("Critical")) {
//         if (plan.includes("Silver")) {
//             planId = "060";
//         } else if (plan.includes("Gold")) {
//             planId = "061";
//         } else if (plan.includes("Diamond")) {
//             planId = "085";
//         } else if (plan.includes("Platinum")) {
//             planId = "086";
//         }
//     } else if (prod.includes("MIB") && prod.includes("Family")) {
//         if (plan.includes("Gold - Family A")) {
//             planId = "076";
//         } else if (plan.includes("Gold - Family B")) {
//             planId = "077";
//         } else if (plan.includes("Gold - Family C")) {
//             planId = "078";
//         } else if (plan.includes("Silver - Family A")) {
//             planId = "079";
//         } else if (plan.includes("Silver - Family B")) {
//             planId = "080";
//         } else if (plan.includes("Silver - Family C")) {
//             planId = "081";
//         }
//     } else if (prod.includes("HBLBanca") && prod.includes("Hospital")) {
//         if (plan.includes("PlanA")) {
//             planId = "102";
//         } else if (plan.includes("PlanB")) {
//             planId = "103";
//         } else if (plan.includes("PlanC")) {
//             planId = "104";
//         }
//     } else if (prod.includes("SHIFA")) {
//         if (plan.includes("Gold")) {
//             planId = "105";
//         } else if (plan.includes("Silver")) {
//             planId = "106";
//         }
//     } else if (prod.includes("SCB") && prod.includes("Family")) {
//         if (plan.includes("SCB Platinum")) {
//             planId = "107";
//         } else if (plan.includes("SCB Gold")) {
//             planId = "108";
//         } else if (plan.includes("SCB Silver")) {
//             planId = "109";
//         }
//     } else if (prod.includes("SEHAT PLAN")) {
//         if (plan.includes("HMB Bronze")) {
//             planId = "112";
//         } else if (plan.includes("HMB Silver")) {
//             planId = "111";
//         } else if (plan.includes("HMB Gold")) {
//             planId = "110";
//         }
//     } else if (prod.includes("Family")) {
//         if (prod.includes("MIB")) {
//             if (plan.includes("Gold")) {
//                 planId = "099";
//             } else if (plan.includes("Silver")) {
//                 planId = "100";
//             } else if (plan.includes("Bronze")) {
//                 planId = "101";
//             }
//         }

//         if (plan.includes("Gold - Family A")) {
//             planId = "057";
//         } else if (plan.includes("Gold - Family B")) {
//             planId = "058";
//         } else if (plan.includes("Gold - Family C")) {
//             planId = "059";
//         } else if (plan.includes("Silver - Family A")) {
//             planId = "054";
//         } else if (plan.includes("Silver - Family B")) {
//             planId = "055";
//         } else if (plan.includes("Silver - Family C")) {
//             planId = "056";
//         } else if (plan.includes("Diamond - Family A")) {
//             planId = "093";
//         } else if (plan.includes("Diamond - Family B")) {
//             planId = "094";
//         } else if (plan.includes("Diamond - Family C")) {
//             planId = "095";
//         } else if (plan.includes("Platinum - Family A")) {
//             planId = "096";
//         } else if (plan.includes("Platinum - Family B")) {
//             planId = "097";
//         } else if (plan.includes("Platinum - Family C")) {
//             planId = "098";
//         }
//     } else if (prod.includes("Parent")) {
//         if (plan.includes("Platinum")) {
//             planId = "068";
//         } else if (plan.includes("Silver")) {
//             planId = "067";
//         } else if (plan.includes("Titanium")) {
//             planId = "087";
//             if (plan.includes("Plus")) {
//                 planId = "088";
//             }
//         } else if (plan.toLowerCase().includes("gold")) {
//             planId = "062";
//         }
//     } else if (prod.includes("Her")) {
//         if (plan.includes("Diamond")) {
//             planId = "089";
//         } else if (plan.includes("Platinum")) {
//             planId = "090";
//         } else {
//             planId = "063";
//         }
//     }

//     return planId;
// }

export function newPlanMapping(prod: string, plan: string): string {
    let planId = "000";

    if (prod.includes("Female Centric Health Takaful") && prod.includes("FBL")) {
        if (plan.includes("Plan A")) {
            planId = "102";
        } else if (plan.includes("Plan B")) {
            planId = "103";
        }
    } else if (prod.includes("Personal Accident") && prod.includes("FBL")) {
        if (plan.includes("Gold")) {
            planId = "099";
        } else if (plan.includes("Silver")) {
            planId = "100";
        } else if (plan.includes("Bronze")) {
            planId = "101";
        }
    } else if (
        !prod.includes("Parent Care Plus") &&
        !prod.includes("Parents Care Plus") &&
        !prod.includes("Parent-Care-Plus") &&
        !prod.includes("Parents-Care-Plus")
    ) {
        if (prod.includes("Personal")) {
            if (prod.includes("FBL")) {
                if (plan.includes("Gold")) {
                    planId = "064";
                } else if (plan.includes("Silver")) {
                    planId = "065";
                } else if (plan.includes("Bronze")) {
                    planId = "066";
                }
            } else if (prod.includes("MIB")) {
                if (plan.includes("Gold")) {
                    planId = "082";
                } else if (plan.includes("Silver")) {
                    planId = "083";
                } else if (plan.includes("Bronze")) {
                    planId = "084";
                }
            } else if (plan.includes("Gold")) {
                planId = "051";
            } else if (plan.includes("Silver")) {
                planId = "052";
            } else if (plan.includes("Bronze")) {
                planId = "053";
            } else if (plan.includes("Diamond")) {
                planId = "091";
            } else if (plan.includes("Platinum")) {
                planId = "092";
            }
        } else if (prod.includes("Critical")) {
            if (plan.includes("Silver")) {
                planId = "060";
            } else if (plan.includes("Gold")) {
                planId = "061";
            } else if (plan.includes("Diamond")) {
                planId = "085";
            } else if (plan.includes("Platinum")) {
                planId = "086";
            }
        } else if (prod.includes("MIB") && prod.includes("Family")) {
            if (plan.includes("Gold - Family A")) {
                planId = "076";
            } else if (plan.includes("Gold - Family B")) {
                planId = "077";
            } else if (plan.includes("Gold - Family C")) {
                planId = "078";
            } else if (plan.includes("Silver - Family A")) {
                planId = "079";
            } else if (plan.includes("Silver - Family B")) {
                planId = "080";
            } else if (plan.includes("Silver - Family C")) {
                planId = "081";
            }
        } else if (prod.includes("HBLBanca") && prod.includes("Hospital")) {
            if (plan.includes("PlanA")) {
                planId = "102";
            } else if (plan.includes("PlanB")) {
                planId = "103";
            } else if (plan.includes("PlanC")) {
                planId = "104";
            }
        } else if (prod.includes("SHIFA")) {
            if (plan.includes("Gold")) {
                planId = "105";
            } else if (plan.includes("Silver")) {
                planId = "106";
            }
        } else if (prod.includes("SCB") && prod.includes("Family")) {
            if (plan.includes("SCB Platinum")) {
                planId = "107";
            } else if (plan.includes("SCB Gold")) {
                planId = "108";
            } else if (plan.includes("SCB Silver")) {
                planId = "109";
            }
        } else if (prod.includes("SEHAT PLAN")) {
            if (plan.includes("HMB Bronze")) {
                planId = "112";
            } else if (plan.includes("HMB Silver")) {
                planId = "111";
            } else if (plan.includes("HMB Gold")) {
                planId = "110";
            }
        } else if (prod.includes("Family")) {
            if (prod.includes("FBL")) {
                if (plan.includes("Gold")) {
                    planId = "099";
                } else if (plan.includes("Silver")) {
                    planId = "100";
                } else if (plan.includes("Bronze")) {
                    planId = "101";
                }
            }

            if (plan.includes("Gold - Family A")) {
                planId = "057";
            } else if (plan.includes("Gold - Family B")) {
                planId = "058";
            } else if (plan.includes("Gold - Family C")) {
                planId = "059";
            } else if (plan.includes("Silver - Family A")) {
                planId = "054";
            } else if (plan.includes("Silver - Family B")) {
                planId = "055";
            } else if (plan.includes("Silver - Family C")) {
                planId = "056";
            } else if (plan.includes("Diamond - Family A")) {
                planId = "093";
            } else if (plan.includes("Diamond - Family B")) {
                planId = "094";
            } else if (plan.includes("Diamond - Family C")) {
                planId = "095";
            } else if (plan.includes("Platinum - Family A")) {
                planId = "096";
            } else if (plan.includes("Platinum - Family B")) {
                planId = "097";
            } else if (plan.includes("Platinum - Family C")) {
                planId = "098";
            }
        } else if (prod.includes("Parent")) {
            if (plan.includes("Platinum")) {
                planId = "068";
            } else if (plan.includes("Silver")) {
                planId = "067";
            } else if (plan.includes("Titanium")) {
                planId = "087";
                if (plan.includes("Plus")) {
                    planId = "088";
                }
            } else if (plan.toLowerCase().includes("gold")) {
                planId = "062";
            }
        } else if (prod.includes("Her")) {
            if (plan.includes("Diamond")) {
                planId = "089";
            } else if (plan.includes("Platinum")) {
                planId = "090";
            } else {
                planId = "063";
            }
        }
    } else if (plan.includes("Platinum Takaful")) {
        planId = "118";
    } else if (plan.includes("Gold Takaful")) {
        planId = "117";
    } else if (plan.includes("Silver Takaful")) {
        planId = "116";
    } else if (plan.includes("Platinum")) {
        planId = "115";
    } else if (plan.includes("Gold")) {
        planId = "114";
    } else if (plan.includes("Silver")) {
        planId = "113";
    }

    return planId;
}


export function newPolicyCode(polId: number): string {
    const policyId = polId.toString();
    const padLength = 7 - policyId.length;

    // Equivalent to Java's substring logic
    const prefix = "0000000".substring(0, padLength);

    return prefix + policyId;
}

export function newProductCode(productCode: number): string {
    const policyId = productCode.toString();
    const padLength = 3 - policyId.length;

    // Equivalent to Java's substring logic
    const prefix = "000".substring(0, padLength);

    return prefix + policyId;
}

export async function courierBooking(
    orderId: number,
    policyId: number,
    code: string,
    data: OrderSchema
) {
    const city = await prisma.city.findUnique({
        where: { id: data.customer_city },
    });
    const courier = await getCourier(data.takaful_policy ?? false);
    if (!courier) return;

    const token = Buffer.from(
        `${process.env.BLUEEX_USERNAME}:${process.env.BLUEEX_PASSWORD}`
    ).toString("base64");

    const datatoSend = {
        shipper_name: "Jubilee General Insurance",
        shipper_email: "support@jubileegeneral.com.pk",
        shipper_contact: "021-111-654-321",
        shipper_address:
            "Jubilee General Insurance Co Ltd, 2nd Floor, Jubilee Insurance House, I. I. Chundrigar Road Karachi",
        shipper_city: "KHI",
        customer_name: data.shipping_name,
        customer_email: data.shipping_email,
        customer_contact: data.shipping_phone,
        customer_address: data.shipping_address,
        customer_city: city ? city.city_code : "KHI",
        customer_country: "PK",
        customer_comment: "Policy courier dispatch",
        shipping_charges: "100",
        payment_type: "COD",
        service_code: "BE",
        total_order_amount: data.received_premium.toString(),
        total_order_weight: "1",
        order_refernce_code: "",
        fragile: "N",
        parcel_type: "N",
        insurance_require: "N",
        insurance_value: "0",
        testbit: "Y",
        cn_generate: "Y",
        multi_pickup: "N",
        products_detail: [
            {
                product_code: code,
                product_name: data.product_details.item_name,
                product_price: data.received_premium.toString(),
                product_weight: "1",
                product_quantity: "1",
                product_variations: "document",
                sku_code: data.product_details.sku,
            },
        ],
    };

    const response = await axios.post(courier.book_url, datatoSend, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${token}`,
        },
    });

    if (response.data?.status === "1") {
        await prisma.order.update({
            where: { id: orderId },
            data: { tracking_number: response.data.cnno, status: "pendingCOD" },
        });
        await prisma.policy.update({
            where: { id: policyId },
            data: { status: "pendingCOD" },
        });
    } else {
        console.error("BlueEx booking failed:", response.data);
    }
}