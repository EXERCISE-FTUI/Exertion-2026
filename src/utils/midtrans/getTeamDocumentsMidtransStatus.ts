import { createClient } from "../supabase/client";

export async function getTeamDocumentsMidtransStatus() {
    const supabase = await createClient();
    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            // console.error('Error getting user session:', userError);
            return { success: false, message: 'Anda harus login untuk melihat status transaksi tim.', data: null };
        }

        const currentUserId = user.id;

        const { data: teams, error: teamsError } = await supabase
            .from('teams')
            .select('id')
            .eq('leader_user_id', currentUserId)
            .limit(1);

        if (teamsError || !teams || teams.length === 0) {
            return { success: false, message: 'Anda tidak memiliki tim terdaftar atau tidak memimpin tim manapun.', data: null };
        }

        const teamId = teams[0].id;
        // console.log(`User ${currentUserId} is leader of team ID: ${teamId}`);

        const { data: transactionData, error: transactionError } = await supabase
            .from('submission_transaction')
            .select('midtrans_transaction_status, midtrans_transaction_id')
            .eq('team_id', teamId)
            .limit(1);


        if (transactionError) {
            // console.error('Error fetching submission transaction:', transactionError);
            return { success: false, message: 'Gagal mengambil status transaksi.', data: null };
        }

        if (!transactionData || transactionData.length === 0) {
            // console.log('Tidak ada transaksi ditemukan untuk tim Anda.');
            return { success: true, message: 'Belum ada transaksi.', data: { midtrans_transaction_status: 'no_transaction_found' } };
        }

        const latestTransaction = transactionData[0];

        if (latestTransaction.midtrans_transaction_status === "settlement") {
            // console.log('Status transaksi telah berhasil (settlement).');
            return { success: true, message: 'Status transaksi telah berhasil.', data: latestTransaction };
        } else {
            // console.log(`Status transaksi saat ini: ${latestTransaction.midtrans_transaction_status}`);
            return { success: true, message: `Transaksi saat ini: ${latestTransaction.midtrans_transaction_status}.`, data: latestTransaction };
        }

    } catch (err) {
        // console.error('An unexpected error occurred:', err);
        return { success: false, message: 'Terjadi kesalahan tak terduga.', data: null };
    }
}