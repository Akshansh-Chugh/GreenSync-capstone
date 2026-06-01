// check email , phone , name , adhaar, totalFeilds, profile_pic
import validator from 'validator';

const { isEmail, isAlpha } = validator;
import { apiError } from "../utils/apiError.js"
import { parsePhoneNumberWithError } from 'libphonenumber-js';

//fetch details
// perform checks
// pushback modified params

    const options = { 
    allow_display_name: false,
    require_display_name: false,
    allow_utf8_local_part: true,
    require_tld: true,
    allow_ip_domain: false,
    allow_underscores: true,
    domain_specific_validation: true,
    blacklisted_chars: '$%#',
    host_blacklist: process.env.EMAIL_BLACKLIST
    }

const Email_check=((req,res,next)=>
{
    const email=req.body.email?.toLowerCase()?.trim() || req.user?.email
    if(!email) throw new apiError(400,"No email")
    if(!isEmail(email,options)) throw new apiError(402,"Invalid Email")
    req.body.email=email
    next()
})
const Name_check=((req,res,next)=>
{
    let name = req.body.name?.toLowerCase() || req.user?.name || req.body.email?.split("@")[0]
    name =name.charAt(0).toUpperCase() + name.slice(1);
    if (!isAlpha(name, 'en-US', { ignore: ' ' })) throw new apiError(402, "Name must only contain letters");
    req.body.name=name
    next()
})

const Phone_check=((req,res,next)=>
{
    let phone= req.body?.phone || req.user?.phone
    if(!phone) next()
    const phoneNumber= parsePhoneNumberWithError(phone,"IN")
    if (!phoneNumber.isValid()) throw new apiError(402,"Invalid Phone number")
    next()
})
const Check_required_fields= [Email_check, Name_check, Phone_check];
export default Check_required_fields;
export { Email_check, Name_check, Phone_check };