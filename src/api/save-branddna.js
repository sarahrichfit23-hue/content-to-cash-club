import { supabase } from "@/lib/supabase";

export async function saveBrandDNA(userId, brandData, pdfFile) {
  try {
    // 1️⃣ Upload the PDF file to Supabase Storage
    const filePath = `branddna/${userId}/${Date.now()}-brand-dna.pdf`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("library-files")
      .upload(filePath, pdfFile, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return { success: false, message: "Upload failed." };
    }

    // 2️⃣ Get the public URL for the PDF
    const { data: publicUrlData } = supabase.storage
      .from("library-files")
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    // 3️⃣ Insert metadata into your `library` table
    const { data: insertData, error: insertError } = await supabase
      .from("library")
      .insert([
        {
          user_id: userId,
          title: brandData.offer_title || "Brand DNA Profile",
          description: brandData.offer_summary || "Your personalized brand strategy document.",
          file_url: publicUrl,
          file_type: "pdf",
          created_at: new Date(),
        },
      ]);

    if (insertError) {
      console.error("Insert error:", insertError);
      return { success: false, message: "Database insert failed." };
    }

    return { success: true, data: insertData };
  } catch (error) {
    console.error("saveBrandDNA error:", error);
    return { success: false, message: error.message };
  }
}
