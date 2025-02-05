<script setup>
import { ref, onMounted, computed } from "vue";
import { supabase } from "../supabase";
import { useToast } from "primevue/usetoast";
const toast = useToast();

const members = ref([]);
const memberName = ref("");
const phoneNumber = ref("");
const isLoading = ref(false);
const dialogVisible = ref(false); // Control Dialog visibility
const selectedMember = ref({ id: null, nama: "", no_telp: "" });

const fetchMember = async () => {
  try {
    isLoading.value = true;
    let { data: membership, error } = await supabase.from("membership").select(`
    id,
    no_telp,
    nama
    `);
    if (error) throw error;
    members.value = membership;
  } catch (error) {
    console.log("error fetching order:", error);
  } finally {
    isLoading.value = false;
  }
};

const insertMember = async () => {
  try {
    if (!phoneNumber.value || !memberName.value) {
      toast.add({
        severity: "warn",
        summary: "Peringatan",
        detail: "Nama dan Nomor Telepon tidak boleh kosong",
        life: 5000,
      });
      return;
    }

    let { error } = await supabase.from("membership").insert([
      {
        no_telp: String(phoneNumber.value).trim() || null,
        nama: memberName.value.trim(),
      },
    ]);

    if (error) throw error;

    toast.add({
      severity: "success",
      summary: "Success",
      detail: "Member berhasil ditambahkan!",
      life: 5000,
    });

    await fetchMember();
    memberName.value = "";
    phoneNumber.value = "";
  } catch (error) {
    console.log("error inserting member data:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Error menambahkan member!",
      life: 5000,
    });
  }
};

const formattedMembers = computed(() => {
  return members.value.map((member) => {
    const noTelp = member.no_telp ? String(member.no_telp) : ""; // Ensure it's a string
    return {
      ...member,
      no_telp: noTelp.startsWith("0") ? noTelp : "0" + noTelp,
    };
  });
});

const formattedSelectedMember = computed(() => {
  if (!selectedMember.value.no_telp) return "";
  const noTelp = String(selectedMember.value.no_telp);
  return noTelp.startsWith("0") ? noTelp : "0" + noTelp;
});

const deleteMember = async (memberId) => {
  try {
    const { error } = await supabase
      .from("membership")
      .delete()
      .eq("id", memberId);
    if (error) throw error;

    toast.add({
      severity: "success",
      summary: "Sukses",
      detail: "Member berhasil dihapus!",
      life: 5000,
    });

    await fetchMember();
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.message,
      life: 3000,
    });
    console.error("Error deleting member:", error);
  }
};

const fetchMemberById = async (id) => {
  dialogVisible.value = true; // Show the dialog
  try {
    isLoading.value = true;
    const { data, error } = await supabase
      .from("membership")
      .select("id, nama, no_telp")
      .eq("id", id)
      .single();

    if (error) throw error;

    selectedMember.value = data;
  } catch (error) {
    console.error("Error fetching category:", error.message);
  } finally {
    isLoading.value = false;
  }
};

const updateMember = async () => {
  try {
    const { id, nama, no_telp } = selectedMember.value;

    if (!id) {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: "ID Member tidak valid",
        life: 5000,
      });
      return;
    }

    const trimmedNoTelp = String(no_telp).trim();
    const trimmedNama = nama.trim();

    if (!trimmedNama || !trimmedNoTelp) {
      toast.add({
        severity: "warn",
        summary: "Peringatan",
        detail: "Nama dan Nomor Telepon tidak boleh kosong",
        life: 5000,
      });
      return;
    }

    const { error } = await supabase
      .from("membership")
      .update({ no_telp: trimmedNoTelp, nama: trimmedNama })
      .eq("id", id);

    if (error) throw error;

    toast.add({
      severity: "success",
      summary: "Sukses",
      detail: "Member berhasil diperbarui!",
      life: 5000,
    });

    await fetchMember();
    dialogVisible.value = false;
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.message,
      life: 3000,
    });
    console.error("Error updating member:", error);
  }
};

const onlyNumbers = (event) => {
  const charCode = event.which ? event.which : event.keyCode;
  if (charCode < 48 || charCode > 57) {
    event.preventDefault();
  }
};

const initializeData = async () => {
  try {
    await fetchMember();
  } catch (error) {
    console.error("Error during initialization:", error.message);
  } finally {
    isLoading.value = false;
  }
};

onMounted(initializeData);
</script>

<template>
  <div class="p-6">
    <div v-if="isLoading" class="flex justify-center">
      <ProgressSpinner />
    </div>
    <div v-else class="flex flex-col gap-6 max-w-full container">
      <section class="main-section flex flex-col gap-4">
        <h2>Registrasi Member</h2>
        <div class="flex justify-between item-center gap-3">
          <div class="flex flex-col gap-3">
            <label for="telfon"> No. Telfon </label>
            <InputText
              v-model="phoneNumber"
              id="telfon"
              class="h-full text-lg max-w-fit"
              placeholder="Masukkan Nomor Telepon"
              @keypress="onlyNumbers"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label for="Nama"> Nama Member </label>
            <InputText
              v-model="memberName"
              row="5"
              cols="30"
              class="h-full text-lg max-w-fit"
              placeholder="Masukkan Nama Member!"
            />
          </div>
          <div class="flex justify-center items-center">
            <Button
              label="Save"
              icon="fa fa-check"
              iconPos="left"
              @click="insertMember"
              :loading="isLoading"
              class="w-fit h-fit mt-6"
            />
          </div>
        </div>
        <div class="container flex flex-col gap-4">
          <DataTable
            :value="formattedMembers"
            stripedRows
            paginator
            :rows="5"
            :rowsPerPageOptions="[5, 10, 20, 50]"
          >
            <Column field="no_telp" header="Nomor Telfon" />
            <Column field="nama" header="Nama Member" />
            <Column header="Aksi" class="flex justify-center">
              <template #body="slotProps">
                <div class="flex justify-center gap-2">
                  <Button
                    label="Edit"
                    icon="fa fa-pencil"
                    class="p-button-rounded p-button-info"
                    @click="fetchMemberById(slotProps.data.id)"
                  />
                  <Button
                    label="Delete"
                    icon="fa fa-trash"
                    class="p-button-rounded p-button-danger"
                    @click="deleteMember(slotProps.data.id)"
                  />
                </div>
              </template>
            </Column>
            <template #empty> Belum ada member baru! </template>
          </DataTable>
        </div>
      </section>
    </div>
  </div>

  <Dialog
    v-model:visible="dialogVisible"
    header="Edit Member"
    :modal="true"
    :closable="true"
    class="w-400px"
  >
    <div v-if="isLoading" class="flex justify-center">
      <ProgressSpinner />
    </div>
    <div v-else>
      <div class="flex flex-col">
        <label for="editNama">Nama</label>
        <InputText
          v-model="selectedMember.nama"
          id="editNama"
          placeholder="Nama Member"
        />
      </div>
      <div class="mt-3 flex flex-col">
        <label for="editNoTelp">Nomor Telepon</label>
        <InputText
          v-model="formattedSelectedMember"
          id="editNoTelp"
          placeholder="Nomor Telepon"
          @input="selectedMember.no_telp = $event.target.value"
        />
      </div>
      <div class="mt-4 flex justify-end">
        <Button
          label="Update"
          icon="fa fa-check"
          class="p-button-rounded p-button-success"
          @click="updateMember(selectedMember?.id)"
        />
      </div>
    </div>
  </Dialog>

  <Toast />
</template>
