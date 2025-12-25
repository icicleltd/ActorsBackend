import { Response } from "express"

const setCookie = (res: Response, fieldName: string, token: string, exprie: number) => {
    res.cookie(`${fieldName}`,token,{
        secure: false,
        httpOnly: true,
        expires: new Date(Date.now() + exprie)
    })
}
export default setCookie