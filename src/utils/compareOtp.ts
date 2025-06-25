export const compareOtp = (user_otp: string | null, input_otp: string): boolean => {
    return user_otp === input_otp;
};