//validation check for sing in
export const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Định dạng email cơ bản (abc@def.ghi)
    if (!email) return "Email không được để trống";
    if (!emailRegex.test(email)) return "Định dạng email không hợp lệ";
    return "";
};

export const validatePassword = (password: string) => {
    const passRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!password) return "Mật khẩu không được để trống";
    if (!passRegex.test(password)) return "Mật khẩu phải từ 8 ký tự, gồm cả chữ và số";
    return "";
};

//validation check for register
export const validateFullName = (fullname:string) => {
    if (!fullname || fullname.trim() === "") return "Họ và tên không được để trống";
    if (fullname.length < 2) return "Họ và tên phải có ít nhất 2 ký tự";
    return "";
}

export const validateConfirmPassword = (password: string, confirmPassword: string) => {
    if (!confirmPassword) return "Xác nhận mật khẩu không được để trống";
    if (password !== confirmPassword) return "Mật khẩu xác nhận không khớp";
    return "";
}
