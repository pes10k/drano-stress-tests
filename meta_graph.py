import os
import sys
from boomslang import Plot, Line
import json
import re


def sort_nicely(l):
    """ Sort the given list in the way that humans expect.
    """
    convert = lambda text: int(text) if text.isdigit() else text
    alphanum_key = lambda key: [convert(c) for c in re.split('([0-9]+)', key)]
    l.sort(key=alphanum_key)


def avg_time_for_test(dir_path):
    trial_times = all_times_for_test(dir_path)
    if len(trial_times) == 0:
        print dir_path
    return sum(trial_times) / float(len(trial_times))


def all_times_for_test(dir_path):
    trial_times = [times_of_trials(a_trial) for a_trial in trial_data_in_test(dir_path)]
    all_times = []
    for a_trials_times in trial_times:
        all_times += a_trials_times
    return all_times


def trial_data_in_test(dir_path):
    return [trials_in_file(os.path.join(dir_path, a_file)) for a_file in os.listdir(dir_path) if ".json" in a_file]


def trials_in_file(file_path):
    record_handle = open(file_path, 'r')
    trial_data = json.load(record_handle)
    record_handle.close()
    return trial_data


def time_of_trial(data):
    return (data[u'end_time'] - data[u'start_time']) if u'success' in data else 1000000


def times_of_trials(trial_datas):
    return [time_of_trial(data) for data in trial_datas]

root_dir = sys.argv[1] if len(sys.argv) >= 2 else "results"

dirs = os.listdir(root_dir)
sort_nicely(dirs)
num_tests = len(dirs)
avg_test_times = [avg_time_for_test(os.path.join(root_dir, a_dir)) for a_dir in dirs]

plot = Plot()

x_vals = [int(a_dir.split("-")[0]) for a_dir in dirs]

line = Line()
line.yValues = avg_test_times
line.xValues = x_vals
plot.add(line)

plot.xLabel = "# Clients"
plot.yLabel = "Miliseconds"
plot.save("mega_graph.png")
