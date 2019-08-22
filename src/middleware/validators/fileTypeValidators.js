export const validateDisplayPicture = (mediaFile) => {
    let extension = mediaFile.mimetype;

    if (!extension) return false;

    if((extension === "image/jpg") || (extension === "image/png") || (extension === "image/jpeg")) {
        return true;
    } else{
        return false;
    }
}